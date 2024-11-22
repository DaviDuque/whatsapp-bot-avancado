import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { sendMessage, sendConfirmPadraoMessage } from '../../infra/integrations/twilio';
import '../../commands';
import { formatarNumeroTelefone } from '../../utils/trata-telefone';
import { formatWithRegex } from '../../utils/formata-dinheiro';
import { cadastrarMeta } from './metas.repository';
import { validarDescricao, validarValorTotal} from '../../utils/validation';
import { criarClientePorTelefone } from '../clientes/clientes.repository';
import { verificarEstado, atualizarEstado, limparEstado,  verificarClienteEstado } from '../../infra/states/states';
import { transcribe } from '../transcribe/transcribe.controler';
import { SummarizeServiceMeta } from '../../infra/integrations/summarize.service';
import dayjs from 'dayjs';
import { GlobalState } from '../../infra/states/global-state';

export class Meta {
    whatsappMeta = async (req: Request, res: Response) => {
        const summarizeServiceMeta = new SummarizeServiceMeta();
        const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
        const globalState = GlobalState.getInstance();
        const condicao = globalState.getClientCondition();
        const cliente_id = await criarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));
        
        if(condicao == "meta"){
            await atualizarEstado(From, "aguardando_dados");
        }

        const cliente = verificarClienteEstado(cliente_id);
        const estadoAtual = await verificarEstado(From);

        if((estadoAtual == 'aguardando_continuacao' && Body =='N') || (estadoAtual == 'aguardando_continuacao' && Body =='n') ){
            globalState.setClientCondition("inicial");
            await sendMessage(To, From, "\u{1F522}Digite *8* para ver o menu");
        }

        if((estadoAtual == 'aguardando_continuacao' && Body =='S') || (estadoAtual == 'aguardando_continuacao' && Body =='s') ){
            await sendMessage(To, From, 
                    `
\u{1F60E}Para definir um meta, digite ou fale os detalhes:
*Nome da meta*
*valor_objetivo*
*valor_atual*
*data_limite*`);
            await atualizarEstado(From, "aguardando_dados");
        }

        if(estadoAtual == 'aguardando_continuacao' 
                && Body !='N' 
                && Body !='n' 
                && Body !='S' 
                && Body !='s'
              ){
                await sendMessage(To, From, "Não reconheci seu comando,Para cadastrar outra meta digite *Sim* ou voltar digite *Não*.");
            }

        if (!estadoAtual) {
            await sendMessage(To, From, `\u{1F4B7}Para cadastrar uma meta, digite ou fale os detalhes:
*Nome da meta*
*valor_objetivo*
*valor_atual*
*data_limite*
                     `);
            await atualizarEstado(From, "aguardando_dados");
        }

        if (estadoAtual === "aguardando_dados") {
            
            const Transcribe = await transcribe(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
            if (!Transcribe) return;
            const response = await summarizeServiceMeta.summarize(Transcribe);
            let [descricao, valor_objetivo, valor_atual, data_limite] = response.split(',');
            const datStr = data_limite.replace(/["'\[\]\(\)]/g, ''); 
            let limiteValor: string = dayjs(datStr).format('YYYY-MM-DD');
            const ValorAtual = parseFloat(valor_atual);
            const ValorObjetivo = parseFloat(valor_objetivo);
            if (!cliente) { return undefined; }

            globalState.setMensagem(`${response}`);

            try {
                const newDescricao = descricao.replace(/["'\[\]\(\)]/g, ''); 

                if (!validarDescricao(newDescricao) || !validarValorTotal(ValorAtual) || !validarValorTotal(ValorObjetivo) || descricao == null) {
                    await sendMessage(To, From, "\u{26A0}Desculpe não entendi, forneça os dados corretos do meta. Você pode digitar ou falar");
                } else {
                    globalState.setClientCondition("meta_1");
                    await atualizarEstado(From, "aguardando_confirmacao_dados");

                    const dadosMsg = ` \u{1F4B5}Meta definida:${newDescricao.trim()}, *Valor Objetivo:${formatWithRegex(ValorObjetivo)}*, *Valor Atual:${formatWithRegex(ValorAtual)}*, *Data Limite:${dayjs(limiteValor).format('DD-MM-YYYY')}*`
                    sendConfirmPadraoMessage(To, From, dadosMsg);
                }
            } catch (error) {
                await sendMessage(To, From, "\u{26A0}Houve um erro ao cadastrar o meta. Por favor, tente novamente.");
            }
        }

        if (estadoAtual === 'aguardando_confirmacao_dados') {
            

        let dados = globalState.getMensagem();
        if(!dados)return null
        
        let [descricao, valor_objetivo, valor_atual, data_limite] = dados.split(',');
        
            if (Body.toUpperCase() === 'S' || Body.trim() === 'Sim') {
                if(cliente){
                    try {
                        const limiteValor = data_limite.replace(/["'\[\]\(\)]/g, ''); 
                        const newDescricao = descricao!.replace(/["'\[\]\(\)]/g, '');
                        const ValorAtual = parseFloat(valor_atual);
                        const ValorObjetivo = parseFloat(valor_objetivo);
                        const resultado = await cadastrarMeta(cliente, newDescricao, ValorObjetivo, ValorAtual, limiteValor);
                        if (resultado?.sucesso) {
                        await sendMessage(To, From, `
\u{1F4B7} Meta cadastrado com sucesso! 
*Meta:* ${newDescricao.trim()}
*Valor Objetivo:* ${formatWithRegex(ValorObjetivo)}
*Valor Atual:* ${formatWithRegex(ValorAtual)}
*Data Limite:*  ${limiteValor}\n
\u{1F4A1}Para cadastrar outra meta digite *5* ou para voltar digite *8* e para sair digite *9*`);
                
                await limparEstado(From);
                globalState.setClientCondition("inicial");  
                        }else{
                            await limparEstado(From);
                            globalState.setClientCondition("inicial");
                            await sendMessage(To, From, "\u{274C}Houve um erro ao cadastrar o meta. Por favor, tente novamente.");
                        }
                    } catch (error) {
                        await limparEstado(From);
                        globalState.setClientCondition("inicial");
                        await sendMessage(To, From, "\u{274C}Houve um erro ao cadastrar o meta. Por favor, tente novamente.");
                    }
                }
            } else if (Body.toUpperCase() === 'N' || Body.trim() === 'Não') {
                await sendMessage(To, From, "\u{274C}Cadastro de meta cancelado. Você pode tentar novamente.");
                await atualizarEstado(From, "aguardando_dados");
            } else {
                await sendMessage(To, From, "\u{26A0}Não reconheci sua resposta. Por favor, responda com *Sim* ou *Não*");
            }
        }
    };
}