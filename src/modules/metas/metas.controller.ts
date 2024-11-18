import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { sendMessage, sendInteractiveMessage } from '../../infra/integrations/twilio';
import '../../commands';
import { formatarNumeroTelefone } from '../../utils/trata-telefone';
import { cadastrarMetaController } from './metas.service';
import { validarDescricao, validarValor, validarValorTotal} from '../../utils/validation';
import { verificaTipoMsg } from '../../utils/verifica-tipo-msg';
import { criarClientePorTelefone } from '../clientes/clientes.repository';
import { verificarEstado, atualizarEstado, limparEstado,  verificarClienteEstado } from '../../infra/states/states';
import { transcribe } from '../transcribe/transcribe.controler';
import { SummarizeServiceMeta } from '../../infra/integrations/summarize.service';
import dayjs from 'dayjs';
import { GlobalState } from '../../infra/states/global-state';

export class Meta {
    whatsapp = async (req: Request, res: Response) => {
        const summarizeServiceMeta = new SummarizeServiceMeta();
        const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
        const globalState = GlobalState.getInstance();
        const mensagem = globalState.getMensagem();
        const condicao = globalState.getClientCondition();
        console.log("variavel global--->", mensagem);

        const cliente_id = await criarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));
        
        if(condicao == "meta"){
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
                    `Para definir um meta, digite ou fale os detalhes:
                *Nome da meta*
                *valor_objetivo*
                *valor_atual*
                *data_limite*
                     `);
                await atualizarEstado(From, "aguardando_dados");
        }

        if(estadoAtual == 'aguardando_continuacao' 
                && Body !='N' 
                && Body !='n' 
                && Body !='S' 
                && Body !='s'
              ){
                await sendMessage(To, From, "Não reconheci seu comando,Para cadastrar outro meta digite 'S' ou voltar digite 'N'.");
            }
            
        
        

        if (!estadoAtual) {
            await sendMessage(To, From, `Para cadastrar um meta, digite ou fale os detalhes:
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
            console.log("transcribe---->", response);

            
            let [descricao, valor_objetivo, valor_atual, data_limite] = response.split(',');
            console.log("testeeeeee", descricao, valor_objetivo, valor_atual, data_limite);

            const limiteValor = parseFloat(data_limite);
            const ValorAtual = parseFloat(valor_atual);
            const ValorObjetivo = parseFloat(valor_objetivo);
            if (!cliente) { return undefined; }

            globalState.setMensagem(`${response}`);

            try {
                const newDescricao = descricao.replace(/["'\[\]\(\)]/g, '');

                
                if (!validarDescricao(descricao) || !validarValorTotal(ValorAtual) || !validarValorTotal(ValorObjetivo) || descricao == null) {
                    await sendMessage(To, From, "Desculpe não entendi, forneça os dados corretos do meta. Você pode digitar ou falar");
                } else {
                    globalState.setClientCondition("meta_1");
                    // Solicitar confirmação dos dados
                    const confirmationMessage = `
Por favor, confirme os dados abaixo:\n
*Meta:* ${newDescricao.trim()}
*Valor Atual:* ${ValorAtual}
*Banco:* ${ValorObjetivo}
*Data Limite:*  ${limiteValor}\n
É correto? Responda com 'S' para sim ou 'N' para não.`;
                    await atualizarEstado(From, "aguardando_confirmacao_dados");
                    await sendMessage(To, From, confirmationMessage);
                    
                }
            } catch (error) {
                console.log("999999", error);
                await sendMessage(To, From, "Houve um erro ao cadastrar o meta. Por favor, tente novamente.");
            }
        }

        if (estadoAtual === 'aguardando_confirmacao_dados') {
            

        let dados = globalState.getMensagem();
        console.log(">>>>>>>>>", dados);
        if(!dados)return null
        
        let [descricao, valor_objetivo, valor_atual, data_limite] = dados.split(',');

        
            if (Body.toUpperCase() === 'S') {

                if(cliente){
                    try {
               
                const newDescricao = descricao!.replace(/["'\[\]\(\)]/g, '');
                const limiteValor = data_limite;
                const ValorAtual = parseFloat(valor_atual);
                const ValorObjetivo = parseFloat(valor_objetivo);
                

                console.log(">>>>>>>>>", dados);
              

              

                const resultado = await cadastrarMetaController(cliente, newDescricao, ValorAtual, ValorObjetivo, limiteValor);
                console.log("*****************:", resultado);
                
                await sendMessage(To, From, `
*Meta cadastrado com sucesso!* 
*Meta:* ${newDescricao.trim()}
*Valor Atual:* ${ValorAtual}
*Banco:* ${ValorObjetivo}
*Data Limite:*  ${limiteValor}\n
\u{1F4A1}Para cadastrar outra meta digite *5* ou voltar digite *8*.`);
                
                await limparEstado(From);
                globalState.setClientCondition("inicial");
                        
                    } catch (error) {
                        await sendMessage(To, From, "Houve um erro ao cadastrar o meta. Por favor, tente novamente.");
                    }
                }
                
            } else if (Body.toUpperCase() === 'N') {
                // Se o usuário não confirmar, voltar ao estado anterior
                await sendMessage(To, From, "Cadastro de meta cancelado. Você pode tentar novamente.");
                await atualizarEstado(From, "aguardando_dados");
            } else {
                await sendMessage(To, From, "Não reconheci sua resposta. Por favor, responda com 'S' para sim ou 'N' para não.");
            }
        }

    };
}