import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { sendMessage, sendInteractiveMessage } from '../../infra/integrations/twilio';
import '../../commands';
import { formatarNumeroTelefone } from '../../utils/trata-telefone';
import { cadastrarCartaoController } from './cartao.service';
import { validarDescricao, validarValor, validarValorTotal} from '../../utils/validation';
import { verificaTipoMsg } from '../../utils/verifica-tipo-msg';
import { criarClientePorTelefone } from '../clientes/clientes.repository';
import { verificarEstado, atualizarEstado, limparEstado,  verificarClienteEstado } from '../../infra/states/states';
import { transcribe } from '../transcribe/transcribe.controler';
import { SummarizeServiceCartao } from '../../infra/integrations/summarize.service';
import dayjs from 'dayjs';
import { GlobalState } from '../../infra/states/global-state';

export class Cartao {
    whatsapp = async (req: Request, res: Response) => {
        const summarizeServiceCartao = new SummarizeServiceCartao();
        const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
        const globalState = GlobalState.getInstance();
        const mensagem = globalState.getMensagem();
        const condicao = globalState.getClientCondition();
        console.log("variavel global--->", mensagem);

        const cliente_id = await criarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));
        
        if(condicao == "cartao"){
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
                    `Para cadastrar um cartão, digite ou fale os detalhes:
                *Nome da cartão*
                *tipo*
                *banco*
                *limite*
                *saldo*
                     `);
                await atualizarEstado(From, "aguardando_dados");
        }

        if(estadoAtual == 'aguardando_continuacao' 
                && Body !='N' 
                && Body !='n' 
                && Body !='S' 
                && Body !='s'
              ){
                await sendMessage(To, From, "Não reconheci seu comando,Para cadastrar outro cartão digite 'S' ou voltar digite 'N'.");
            }
            
        
        

        if (!estadoAtual) {
            await sendMessage(To, From, `Para cadastrar um cartão, digite ou fale os detalhes:
*Nome da cartão*
*tipo*
*banco*
*limite*
*saldo*
                     `);
            await atualizarEstado(From, "aguardando_dados");
        }

        if (estadoAtual === "aguardando_dados") {
            
            const Transcribe = await transcribe(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
            if (!Transcribe) return;

            const response = await summarizeServiceCartao.summarize(Transcribe);
            console.log("transcribe---->", response);
            
            let [nome_cartao, tipo, banco, limite, saldo] = response.split(',');
            console.log("testeeeeee", nome_cartao, tipo, banco, limite, saldo);

            //let dataString: string = dayjs(dataStr).format('YYYY-MM-DD');
            //if (dataString === 'Invalid Date') { dataString = dayjs().format('YYYY-MM-DD'); }
            
            const limiteValor = parseFloat(limite);
            const saldoValor = parseFloat(saldo);
            if (!cliente) { return undefined; }

            globalState.setMensagem(`${response}`);

            try {
                const newNomeCartao = nome_cartao.replace(/["'\[\]\(\)]/g, '');
                const newTipo = tipo.replace(/["'\[\]\(\)]/g, '');
                const newBanco = banco.replace(/["'\[\]\(\)]/g, '');
                
                if (!validarDescricao(nome_cartao) || !validarValorTotal(limiteValor) || !validarValorTotal(saldoValor) || newNomeCartao == null) {
                    await sendMessage(To, From, "Desculpe não entendi, forneça os dados corretos do cartão. Você pode digitar ou falar");
                } else {
                    globalState.setClientCondition("cartao_1");
                    // Solicitar confirmação dos dados
                    const confirmationMessage = `
Por favor, confirme os dados abaixo:\n
*Cartão:* ${newNomeCartao.trim()}
*tipo:* ${newTipo.trim()}
*Banco:* ${newBanco.trim()}
*Limite:*  ${limiteValor}
*Saldo:* ${saldoValor} \n
É correto? Responda com 'S' para sim ou 'N' para não.`;
                    await atualizarEstado(From, "aguardando_confirmacao_dados");
                    await sendMessage(To, From, confirmationMessage);
                    
                }
            } catch (error) {
                console.log("999999", error);
                await sendMessage(To, From, "Houve um erro ao cadastrar o cartão. Por favor, tente novamente.");
            }
        }

        if (estadoAtual === 'aguardando_confirmacao_dados') {
            

        let dados = globalState.getMensagem();
        console.log(">>>>>>>>>", dados);
        if(!dados)return null
        
        let [nome_cartao, tipo, banco, limite, saldo] = dados.split(',');

        
            if (Body.toUpperCase() === 'S') {

                if(cliente){
                    try {

                        //let dataString: string = dayjs( dataStr!).format('YYYY-MM-DD');
                //console.log("data formatada 111", dataString);

                //if (dataString == 'Invalid Date') { dataString = dayjs().format('YYYY-MM-DD') }
                //console.log("data formatada 2222", dataString);
                
               
                const newNomeCartao = nome_cartao!.replace(/["'\[\]\(\)]/g, '');
                const newTipo = tipo.replace(/["'\[\]\(\)]/g, '');
                const newBanco = banco.replace(/["'\[\]\(\)]/g, '');
                const limiteValor = parseFloat(limite);
                const saldoValor = parseFloat(saldo);
                

                console.log(">>>>>>>>>", dados);
                console.log(">>>>>>>>>", newNomeCartao);
                console.log(">>>>>>>>>", newTipo);
                console.log(">>>>>>>>>", newBanco);
                console.log(">>>>>>>>>", limiteValor);
                console.log(">>>>>>>>>", saldoValor);

              

                const resultado = await cadastrarCartaoController(cliente, newNomeCartao, newTipo, newBanco, limiteValor, saldoValor);
                console.log("*****************:", resultado);
                
                await sendMessage(To, From, `
*Cartão cadastrado com sucesso!* 
*Cartão:* ${newNomeCartao.trim()}
*tipo:* ${newTipo.trim()}
*Banco:* ${newBanco.trim()}
*Limite:*  ${limiteValor}
*Saldo:* ${saldoValor} \n
\u{1F4A1}Para cadastrar outro cartão digite *4* ou voltar digite *8*.`);
                
                await limparEstado(From);
                globalState.setClientCondition("inicial");
                        
                    } catch (error) {
                        await sendMessage(To, From, "Houve um erro ao cadastrar o cartão. Por favor, tente novamente.");
                    }
                }
                
            } else if (Body.toUpperCase() === 'N') {
                // Se o usuário não confirmar, voltar ao estado anterior
                await sendMessage(To, From, "Cadastro de cartão cancelado. Você pode tentar novamente.");
                await atualizarEstado(From, "aguardando_dados");
            } else {
                await sendMessage(To, From, "Não reconheci sua resposta. Por favor, responda com 'S' para sim ou 'N' para não.");
            }
        }

    };
}