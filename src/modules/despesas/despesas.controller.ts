import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { sendMessage, sendInteractiveMessage } from '../../infra/integrations/twilio';
import '../../commands';
import { formatarNumeroTelefone } from '../../utils/trata-telefone';
import { cadastrarDespesaController } from './despesas.service';
import { validarDescricao, validarValor, validarData } from '../../utils/validation';
import { criarClientePorTelefone } from '../clientes/clientes.repository';
import { verificarEstado, atualizarEstado, limparEstado,  verificarClienteEstado } from '../../infra/states/states';
import { transcribe } from '../transcribe/transcribe.controler';
import { SummarizeServiceDespesas } from '../../infra/integrations/summarize.service';
import dayjs from 'dayjs';
import { GlobalState } from '../../infra/states/global-state';

export class Despesas {
    whatsapp = async (req: Request, res: Response) => {
        const summarizeServiceDespesas = new SummarizeServiceDespesas();
        const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
        const globalState = GlobalState.getInstance();
        const mensagem = globalState.getMensagem();
        const condicao = globalState.getClientCondition();

        const cliente_id = await criarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));
        console.log("PostbackData>>>>>>", Body);
        if(condicao == "despesas"){
        await atualizarEstado(From, "aguardando_dados");
        }

        const cliente = verificarClienteEstado(cliente_id);
        const estadoAtual = await verificarEstado(From);

    
        if((estadoAtual == 'aguardando_continuacao' && Body =='N') || (estadoAtual == 'aguardando_continuacao' && Body =='n') ){
                globalState.setClientCondition("inicial");
                await sendMessage(To, From, "Digite 8 para ver o menu");
        }

        if((estadoAtual == 'aguardando_continuacao' && Body =='S') || (estadoAtual == 'aguardando_continuacao' && Body =='s') ){
                await sendMessage(To, From, 
                    `\u{1F44D} Para cadastrar uma despesa, digite ou fale os detalhes: 
*Nome da despesa*
*data* 
*Valor*
*dia*
*Parcelado?* S/N
`
                );
                await atualizarEstado(From, "aguardando_dados");
        }

        if(estadoAtual == 'aguardando_continuacao' 
                && Body !='N' 
                && Body !='n' 
                && Body !='S' 
                && Body !='s'
              ){
                await sendMessage(To, From, "Não reconheci seu comando,Para cadastrar outra despesa digite 'S' ou voltar digite 'N'.");
        }

        if (!estadoAtual) {
            await sendMessage(To, From, `\u{1F44D} Para cadastrar uma despesa, digite ou fale os detalhes: 
*Nome da despesa*
*data* 
*Valor*
*dia*
*Parcelado?* S/N
`);
            await atualizarEstado(From, "aguardando_dados");
        }

        if (estadoAtual === "aguardando_dados") {
            

            const Transcribe = await transcribe(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
            if (!Transcribe) return;
            const response = await summarizeServiceDespesas.summarize(Transcribe);
            let [descricao, valorStr, dataStr, categoria, parcelado] = response.split(',');
            let dataString: string = dayjs(dataStr).format('YYYY-MM-DD');
            if (dataString === 'Invalid Date') { dataString = dayjs().format('YYYY-MM-DD'); }

            const valor = parseFloat(valorStr);
            if (!cliente) { return undefined; }

            globalState.setMensagem(`${response}`);

            try {
                const newDescricao = descricao.replace(/["'\[\]\(\)]/g, '');
                
                if (!validarDescricao(descricao) || !validarValor(valor) || !validarData(dataString) || newDescricao == null) {
                    await sendMessage(To, From, "\u{26A0} Desculpe não entendi, forneça os dados corretos da despesa. Muita atenção ao VALOR, Você pode digitar ou falar");
                } else {
                    globalState.setClientCondition("despesas_1");
                    const confirmationMessage = `
Por favor, confirme os dados abaixo:\n
*Despesa:* ${newDescricao.trim()}
*Valor:* ${valor}
*Data:* ${dayjs(dataString).format('DD-MM-YYYY')}\n
É correto? Responda com 'S' para sim ou 'N' para não.`;
                    await atualizarEstado(From, "aguardando_confirmacao_dados");
                   await sendMessage(To, From, confirmationMessage); 
                   await sendInteractiveMessage(To, From);  
                   //return 0;
                   //return res.json({ message: "não deu"});
                }
            } catch (error) {
                await sendMessage(To, From, "\u{274C} Houve um erro ao cadastrar a despesa. Por favor, tente novamente.");
            }
        }

        if (estadoAtual === 'aguardando_confirmacao_dados') {
            
        let dados = globalState.getMensagem();
        if(!dados)return null
        let [descricao, valorStr, dataStr, categoria, parcelado] = dados.split(',');
        
            if (Body.toUpperCase() === 'S' || Body.trim() === 'Sim') {

                if(cliente){
                    try {
                        let dataString: string = dayjs( dataStr!).format('YYYY-MM-DD');

                if (dataString == 'Invalid Date') { dataString = dayjs().format('YYYY-MM-DD') }

                const newDescricao = descricao!.replace(/["'\[\]\(\)]/g, '');
                const newCategoria = categoria!.replace(/["'\[\]\(\)]/g, '');
                const newParcelado = parcelado!.replace(/["'\[\]\(\)]/g, '');
                const valor = parseFloat(valorStr);

                const resultado = await cadastrarDespesaController(cliente, newDescricao, valor, dataString, newCategoria, newParcelado);
                console.log("*****************:", resultado);
                
                await sendMessage(To, From, `
*Despesa cadastrada com sucesso!* 
\u{1F4B8} *Despesa:* ${newDescricao.trim()}
\u{1F4B4} *Valor:* ${valor} 
\u{231A} *Data:* ${dayjs(dataString).format('DD-MM-YYYY')} \n
\u{1F4A1} Para cadastrar outra despesa digite *1* ou voltar digite *8*.`);
                
                await limparEstado(From);
                globalState.setClientCondition("inicial");
                
                        
                    } catch (error) {
                        await sendMessage(To, From, "\u{274C} Houve um erro ao cadastrar a despesa. Por favor, tente novamente.");
                    }
                }
                
            } else if (Body.toUpperCase() === 'N' || Body.trim() === 'Não') {
                await sendMessage(To, From, "\u{26A0} Sem problemas. Você pode enviar os dados novamente.");
                await atualizarEstado(From, "aguardando_dados");
            } else {
                await atualizarEstado(From, "aguardando_dados");
                await sendMessage(To, From, "\u{274C} Não reconheci sua resposta. Por favor, responda com 'S' para sim ou 'N' para não.");
            }
        }

    };
}