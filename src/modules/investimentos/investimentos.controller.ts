// receitas.controller.ts
import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { sendMessage } from '../../infra/integrations/twilio';
import { formatarNumeroTelefone } from '../../utils/trata-telefone';
import { cadastrarInvestimentoService } from './investimentos.service';
import { validarDescricao, validarValor, validarData } from '../../utils/validation';
import { criarClientePorTelefone } from '../clientes/clientes.repository';
import { verificarEstado, atualizarEstado, limparEstado, verificarClienteEstado } from '../../infra/states/states';
import { GlobalState } from '../../infra/states/global-state';
import { transcribe } from '../transcribe/transcribe.controler';
import { SummarizeServiceInvestimentos } from '../../infra/integrations/summarize.service';
import dayjs from 'dayjs';


export class Investimentos {
    processarMensagemInvestimentos = async (req: Request, res: Response) => {
        const summarizeServiceInvestimentos = new SummarizeServiceInvestimentos();
        const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
        const globalState = GlobalState.getInstance();
        const condicao = globalState.getClientCondition();
        const cliente_id = await criarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));

        if(condicao == "investimentos"){
            await atualizarEstado(From, "aguardando_dados");
            }
            const cliente = verificarClienteEstado(cliente_id);
            const estadoAtual = await verificarEstado(From);

        if (!estadoAtual) {
            await atualizarEstado(From, 'aguardando_dados');
            await sendMessage(To, From, 
                `\u{1F44D} Para cadastrar uma investimento, envie os detalhes: 
*Nome da investimento*
*Valor*
*Data*
*Categoria*
`);
        }

        if((estadoAtual == 'aguardando_continuacao' && Body =='N') || (estadoAtual == 'aguardando_continuacao' && Body =='n') ){
            globalState.setClientCondition("inicial");
            await sendMessage(To, From, "Digite 8 para ver o menu");
        }

        if((estadoAtual == 'aguardando_continuacao' && Body =='S') || (estadoAtual == 'aguardando_continuacao' && Body =='s') ){
            await sendMessage(To, From, `\u{1F44D} Para cadastrar uma investimento, envie os detalhes: 
*Nome da investimento*
*Valor*
*Data*
*Categoria*
`);
            await atualizarEstado(From, "aguardando_dados");
        }

        if(estadoAtual == 'aguardando_continuacao' 
            && Body !='N' 
            && Body !='n' 
            && Body !='S' 
            && Body !='s'
          ){
            await sendMessage(To, From, "\u{1F914} Não reconheci seu comando,Para cadastrar outro investimento  digite 'S' ou voltar digite 'N'.");
        }

    let investimentoDados: { descricao?: string; valor?: number; dataString?: string; categoria?: string } | null = null;

    if (estadoAtual === 'aguardando_dados') {

        const Transcribe = await transcribe(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
        if (!Transcribe) return;

    const response = await summarizeServiceInvestimentos.summarize(Transcribe);
 
    let [descricao, valorStr, dataStr, categoria] = response.split(',');
    let dataString: string = dayjs(dataStr).format('YYYY-MM-DD');

    if (dataString == 'Invalid Date') { dataString = dayjs().format('YYYY-MM-DD') }
    const valor = parseFloat(valorStr);
    if (!cliente) { return undefined }

    globalState.setMensagem(`${response}`);

    try {
        const newDescricao = descricao.replace(/["'\[\]\(\)]/g, '');
        const newCategoria = categoria.replace(/["'\[\]\(\)]/g, '');

        if (!validarDescricao(descricao) || !validarValor(valor) || !validarData(dataString)) {
            await sendMessage(To, From, "\u{26A0} Desculpe não entendi, forneça os dados corretos do investimento. Você pode digitar ou falar");
        } else {
            investimentoDados = { descricao: newDescricao, valor, dataString, categoria: newCategoria };
            await atualizarEstado(From, "confirmacao_dados");
            globalState.setClientCondition("investimentos_1");
            await sendMessage(To, From, `Por favor, confirme os dados do investimento: 
\u{1F4B5} *Investimento:* ${newDescricao.trim()}
\u{1F4B0} *Valor:* ${valor}
\u{231A} *Data:* ${dayjs(dataString).format('DD-MM-YYYY')}
Responda com 'S' para confirmar ou 'N' para corrigir os dados.`); 
        }
    } catch (error) {
        await sendMessage(To, From, "\u{274C} Houve um erro ao cadastrar o investimento. Por favor, tente novamente.");
    }
}

if (estadoAtual == 'confirmacao_dados') {
   
    if (Body.toUpperCase() === 'S') {

        let dados = globalState.getMensagem();
      
        if(!dados)return null
        let [descricao, valorStr, dataStr, categoria] = dados.split(',');
        
        if (cliente) {
            try {
                let dataString: string = dayjs( dataStr!).format('YYYY-MM-DD');

                if (dataString == 'Invalid Date') { dataString = dayjs().format('YYYY-MM-DD') }

                const newDescricao = descricao!.replace(/["'\[\]\(\)]/g, '');
                const newCategoria = categoria!.replace(/["'\[\]\(\)]/g, '');
                const valor = parseFloat(valorStr);

                const resultado = await cadastrarInvestimentoService(
                    cliente,
                    newDescricao,
                    valor!,
                    dataString!,
                    newCategoria!
                );
                await sendMessage(To, From, `Investimento cadastrado com sucesso\u{1F60E}  \n
\u{1F4B5} *Investimento:* ${newDescricao.trim()}
\u{1F4B0} *Valor:* ${valor}
\u{231A} *Data:* ${dayjs(dataString).format('DD-MM-YYYY')}\n
\u{1F4A1} Para cadastrar outro investimento digite '3' ou voltar digite '8'.`);
                await limparEstado(From);
                globalState.setClientCondition("inicial");
            } catch (error) {
                await sendMessage(To, From, "\u{274C} Houve um erro ao cadastrar o investimento. Por favor, tente novamente.");
            }
        } else {
            await sendMessage(To, From, "\u{274C}Erro: dados do investimento ou cliente não estão disponíveis.");
        }
    } else if (Body.toUpperCase() === 'N') {
        await sendMessage(To, From, "\u{1F534} Por favor, envie novamente os detalhes do investimento.");
        await atualizarEstado(From, "aguardando_dados");
    } else {
        await sendMessage(To, From, "\u{1F914} Não reconheci seu comando. Responda com 'S' para confirmar ou 'N' para corrigir os dados.");
    }
}
    }
}