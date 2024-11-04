// receitas.controller.ts
import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { sendMessage } from '../../infra/integrations/twilio';
import { formatarNumeroTelefone } from '../../utils/trata-telefone';
import { cadastrarInvestimentoService } from './investimentos.service';
import { validarDescricao, validarValor, validarData } from '../../utils/validation';
import { verificaTipoMsg } from '../../utils/verifica-tipo-msg';
import { criarClientePorTelefone } from '../clientes/clientes.repository';
import { verificarEstado, atualizarEstado, limparEstado, verificarClienteEstado } from '../../infra/states/states';
import { GlobalState } from '../../infra/states/global-state';
import { transcribe } from '../transcribe/transcribe.controler';
import { SummarizeServiceInvestimentos } from '../../infra/integrations/summarize.service';
import dayjs from 'dayjs';

const dadosReceitasTemporarios: { [key: string]: any } = {};

// Função principal para processar mensagens relacionadas ao cadastro de receita
export class Investimentos {
    processarMensagemInvestimentos = async (req: Request, res: Response) => {
        const summarizeServiceInvestimentos = new SummarizeServiceInvestimentos();
        const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
        const telefone = formatarNumeroTelefone(From);
        const TipoMSG = verificaTipoMsg(NumMedia, MediaContentType0, MediaUrl0);
        //const estadoAtual = await verificarEstado(From);
        const globalState = GlobalState.getInstance();
        const condicao = globalState.getClientCondition();


        const cliente_id = await criarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));

         
        if(condicao == "investimentos"){
            await atualizarEstado(From, "aguardando_dados");
            }
            const cliente = verificarClienteEstado(cliente_id);
            const estadoAtual = await verificarEstado(From);

        if (!estadoAtual) {
            //cliente = await criarClientePorTelefone(From);
            await atualizarEstado(From, 'aguardando_dados');
            await sendMessage(To, From, 'Para cadastrar um investimento, envie os detalhes como: nome do investimento, data, dia, tipo:');

        }

        if((estadoAtual == 'aguardando_continuacao' && Body =='N') || (estadoAtual == 'aguardando_continuacao' && Body =='n') ){
            globalState.setClientCondition("inicial");
            await sendMessage(To, From, "Digite 8 para ver o menu");
        }

        if((estadoAtual == 'aguardando_continuacao' && Body =='S') || (estadoAtual == 'aguardando_continuacao' && Body =='s') ){
            await sendMessage(To, From, "Para cadastrar um investimento, digite ou fale os detalhes como: nome da investimento, data, tipo");
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

        //const estadoAtual = await verificarEstado(From);
        console.log("estadoAtual--->>", estadoAtual)
        // Processamento baseado no estado atual da conversa
       // ... (código anterior)

// Adicione um objeto para armazenar os dados do investimento
let investimentoDados: { descricao?: string; valor?: number; dataString?: string; categoria?: string } | null = null;

if (estadoAtual === 'aguardando_dados') {



    const Transcribe = await transcribe(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
    if (!Transcribe) return;

    const response = await summarizeServiceInvestimentos.summarize(Transcribe);
    console.log("transcribe---->", response);




    let [descricao, valorStr, dataStr, categoria] = response.split(',');
    console.log("testeeeeee", descricao, valorStr, dataStr, categoria);



    let dataString: string = dayjs(dataStr).format('YYYY-MM-DD');
    console.log("data formatada 1", dataString);

    if (dataString == 'Invalid Date') { dataString = dayjs().format('YYYY-MM-DD') }
    console.log("data formatada 2", dataString);
    const valor = parseFloat(valorStr);
    if (!cliente) { return undefined }

    //globalState.setMensagem(`${response}, ${descricao}, ${valorStr}, ${dataStr}, ${categoria}`);
    globalState.setMensagem(`${response}`);


    try {
        const newDescricao = descricao.replace(/["'\[\]\(\)]/g, '');
        const newCategoria = categoria.replace(/["'\[\]\(\)]/g, '');

        if (!validarDescricao(descricao) || !validarValor(valor) || !validarData(dataString)) {
            await sendMessage(To, From, "Desculpe não entendi, forneça os dados corretos do investimento. Você pode digitar ou falar");
        } else {
            // Armazena os dados no objeto
            investimentoDados = { descricao: newDescricao, valor, dataString, categoria: newCategoria };
            await atualizarEstado(From, "confirmacao_dados");
            globalState.setClientCondition("investimentos_1");
            // Solicita confirmação
            await sendMessage(To, From, `Por favor, confirme os dados do investimento: 
\u{1F4B5} Investimento: ${newDescricao}
\u{1F4B0} Valor: ${valor}
\u{231A} Data: ${dayjs(dataString).format('DD-MM-YYYY')}
Responda com 'S' para confirmar ou 'N' para corrigir os dados.`);
           
        }
    } catch (error) {
        await sendMessage(To, From, "Houve um erro ao cadastrar o investimento. Por favor, tente novamente.");
    }
}

if (estadoAtual == 'confirmacao_dados') {
   
    if (Body.toUpperCase() === 'S') {
        console.log(">>>>>>>>>", investimentoDados);

        let dados = globalState.getMensagem();
      
        if(!dados)return null
        let [descricao, valorStr, dataStr, categoria] = dados.split(',');
        
        // Verifica se os dados do investimento e o cliente estão definidos
        if (cliente) {
            try {
                let dataString: string = dayjs( dataStr!).format('YYYY-MM-DD');
                console.log("data formatada 111", dataString);

                if (dataString == 'Invalid Date') { dataString = dayjs().format('YYYY-MM-DD') }
                console.log("data formatada 2222", dataString);

                const newDescricao = descricao!.replace(/["'\[\]\(\)]/g, '');
                const newCategoria = categoria!.replace(/["'\[\]\(\)]/g, '');
                const valor = parseFloat(valorStr);

                console.log(">>>>>>>>>", dados);
        console.log(">>>>>>>>>", newDescricao);
        console.log(">>>>>>>>>", valor);
        console.log(">>>>>>>>>", dataString);
        console.log(">>>>>>>>>", newCategoria);

                const resultado = await cadastrarInvestimentoService(
                    cliente,
                    newDescricao,
                    valor!,
                    dataString!,
                    newCategoria!
                );
                console.log("*****************:", resultado);
                await sendMessage(To, From, `Investimento cadastrado com sucesso \u{1F60E}! 
\u{1F4B5} Investimento: ${descricao}
\u{1F4B0} Valor: ${valor}
\u{231A} Data: ${dayjs(dataString).format('DD-MM-YYYY')}
\u{1F4A1} Para cadastrar outro investimento digite 'S' ou voltar digite 'N'.`);
                await atualizarEstado(From, "aguardando_continuacao");
                globalState.setClientCondition("investimento_2");
            } catch (error) {
                await sendMessage(To, From, "Houve um erro ao cadastrar o investimento. Por favor, tente novamente.");
            }
        } else {
            await sendMessage(To, From, "Erro: dados do investimento ou cliente não estão disponíveis.");
        }
    } else if (Body.toUpperCase() === 'N') {
        await sendMessage(To, From, "Por favor, envie novamente os detalhes do investimento.");
        await atualizarEstado(From, "aguardando_dados");
    } else {
        await sendMessage(To, From, "\u{1F914} Não reconheci seu comando. Responda com 'S' para confirmar ou 'N' para corrigir os dados.");
    }
}



// ... (código posterior)

    }}