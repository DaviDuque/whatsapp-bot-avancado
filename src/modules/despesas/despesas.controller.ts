import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { sendMessage, sendConfirmPadraoMessage } from '../../infra/integrations/twilio';
import { formatWithRegex} from '../../utils/formata-dinheiro';
import '../../commands';
import { formatarNumeroTelefone } from '../../utils/trata-telefone';
import { cadastrarDespesa } from './despesas.repository';
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
        const condicao = globalState.getClientCondition();

        const cliente_id = await criarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));
        if(condicao == "despesas"){
           await atualizarEstado(From, "aguardando_dados");
        }

        const cliente = verificarClienteEstado(cliente_id);
        const estadoAtual = await verificarEstado(From);
    
        if((estadoAtual == 'aguardando_continuacao' && Body =='N') || (estadoAtual == 'aguardando_continuacao' && Body =='n') ){
                globalState.setClientCondition("inicial");
                await sendMessage(To, From, "\u{1F44D}Digite *8* para ver o menu");
        }

        if((estadoAtual == 'aguardando_continuacao' && Body =='S') || (estadoAtual == 'aguardando_continuacao' && Body =='s') ){
                await sendMessage(To, From, 
                    `\u{1F44D} Para cadastrar uma despesa, digite ou fale os detalhes: 
*Nome da despesa*
*data* 
*Valor*
*Método de pagamento* (Crédito parcelado, Crédito a vista, Débito, PIX)
`);
                await atualizarEstado(From, "aguardando_dados");
        }

        if(estadoAtual == 'aguardando_continuacao' 
                && Body !='N' 
                && Body !='n' 
                && Body !='S' 
                && Body !='s'
            ){
            await sendMessage(To, From, "\u{26A0}Não reconheci seu comando,Para cadastrar outra despesa digite 'S' ou voltar digite 'N'.");
        }

        if (!estadoAtual) {
            await sendMessage(To, From, `\u{1F44D} Para cadastrar uma despesa, digite ou fale os detalhes: 
*Nome da despesa*
*data* 
*Valor*
*Método de pagamento* (Crédito parcelado, Crédito a vista, Débito, PIX)
`);
            await atualizarEstado(From, "aguardando_dados");
        }

        if (estadoAtual === "aguardando_dados") {
            const Transcribe = await transcribe(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
            if (!Transcribe) return;
            const response = await summarizeServiceDespesas.summarize(Transcribe);
            console.log(">>>>>>summerize", response);
            let [descricao, valorStr, dataStr, categoria, metodo_pagamento] = response.split(',');

            if(descricao==null ||  valorStr==null || dataStr==null || categoria==null ||metodo_pagamento==null){
               console.log("Ops !!!!!!!!!!!!", descricao, valorStr, dataStr, categoria, metodo_pagamento);
            }
            let dataString: string = dayjs(dataStr).format('YYYY-MM-DD');
            if (dataString === 'Invalid Date') { dataString = dayjs().format('YYYY-MM-DD'); }
            console.log(">>>>>>tese", descricao, valorStr, dataStr, categoria, metodo_pagamento);
            const valor = parseFloat(valorStr);
            if (!cliente) { return undefined; }

            globalState.setMensagem(`${response}`);

            try {
                const newDescricao = descricao.replace(/["'\[\]\(\)]/g, '');
                const newCategoria = categoria!.replace(/["'\[\]\(\)]/g, '');
                const newMetodo = metodo_pagamento!.replace(/["'\[\]\(\)]/g, '');
                console.log(">>>>>>tese", newDescricao, newCategoria, newMetodo);
                
                if (!validarDescricao(descricao) || !validarValor(valor) || !validarData(dataString) || newDescricao == null) {
                    console.log(">>>>>>errrooo", newDescricao, newCategoria, newMetodo);
                    await sendMessage(To, From, "\u{26A0} Desculpe não entendi, forneça os dados corretos da despesa. Muita atenção ao VALOR, Você pode digitar ou falar");
                } else {
                    console.log(">>>>>>acerto", newDescricao, newCategoria, newMetodo);
                    globalState.setClientCondition("despesas_1");
                   const dadosMsg = ` \u{1F4B8}Despesa: *${newDescricao.trim()}*, *Valor:${formatWithRegex(valor)}*, *Data:${dayjs(dataString).format('DD-MM-YYYY')}* , ${newCategoria}, ${newMetodo}`;
                   await atualizarEstado(From, "aguardando_confirmacao_dados");
                   sendConfirmPadraoMessage(To, From, dadosMsg); 
                }
            } catch (error) {
                await sendMessage(To, From, "\u{274C} AHouve um erro ao cadastrar a despesa. Por favor, tente novamente.");
            }
        }

        if (estadoAtual === 'aguardando_confirmacao_dados') {
            
        let dados = globalState.getMensagem();
        if(!dados)return null
        let [descricao, valorStr, dataStr, categoria, metodo_pagamento] = dados.split(',');
        console.log(">>>>>>", descricao, valorStr, dataStr, categoria, metodo_pagamento);
        
            if (Body.toUpperCase() === 'S' || Body.trim() === 'Sim') {
                if(cliente){
                    try {
                        let dataString: string = dayjs( dataStr!).format('YYYY-MM-DD');

                if (dataString == 'Invalid Date') { dataString = dayjs().format('YYYY-MM-DD') }

                const newDescricao = descricao!.replace(/["'\[\]\(\)]/g, '');
                const newCategoria = categoria!.replace(/["'\[\]\(\)]/g, '');
                const newMetodo = metodo_pagamento!.replace(/["'\[\]\(\)]/g, '');
                const valor = parseFloat(valorStr);
                const resultado = await cadastrarDespesa(cliente, newDescricao, valor, dataString, newCategoria, newMetodo);
                await sendMessage(To, From, `
*Despesa cadastrada com sucesso!* 
\u{1F4B8} *Despesa:* ${newDescricao.trim()}
\u{1F4B4} *Valor:* ${formatWithRegex(valor)} 
\u{231A} *Data:* ${dayjs(dataString).format('DD-MM-YYYY')},
\u{1F4C4} *Categoria:* ${newCategoria.trim()},
\u{1F5F3} *Método de pagamento:* ${newMetodo.trim()} \n
\u{1F4A1}Para cadastrar nova despesa digite *1* \n para voltar ao menu digite *8* \n e para sair digite *9*`);
                
                await limparEstado(From);
                globalState.setClientCondition("inicial");
                
                        
                    } catch (error) {
                        await limparEstado(From);
                        globalState.setClientCondition("inicial");
                        await sendMessage(To, From, "\u{274C} BHouve um erro ao cadastrar a despesa. Por favor, tente novamente.");
                    }
                }
                
            } else if (Body.toUpperCase() === 'N' || Body.trim() === 'Não') {
                await sendMessage(To, From, "\u{26A0} Sem problemas. Você pode enviar os dados novamente.");
                await atualizarEstado(From, "aguardando_dados");
            } else {
                await atualizarEstado(From, "aguardando_confirmacao_dados");
                await sendMessage(To, From, "\u{274C} Não reconheci sua resposta. Por favor, responda com 'Sim' para sim ou 'Não' para não.");
            }
        }

    };
}