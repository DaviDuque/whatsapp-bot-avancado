import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { sendMessage, sendConfirmPadraoMessage } from '../../infra/integrations/twilio';
import '../../commands';
import { formatWithRegex} from '../../utils/formata-dinheiro';
import { formatarNumeroTelefone } from '../../utils/trata-telefone';
import { cadastrarCartao } from './cartao.repository';
import { validarDescricao, validarValorTotal} from '../../utils/validation';
import { criarClientePorTelefone } from '../clientes/clientes.repository';
import { verificarEstado, atualizarEstado, limparEstado,  verificarClienteEstado } from '../../infra/states/states';
import { transcribe } from '../transcribe/transcribe.controler';
import { SummarizeServiceCartao } from '../../infra/integrations/summarize.service';
import { GlobalState } from '../../infra/states/global-state';

export class Cartao {
    whatsappCartao = async (req: Request, res: Response) => {
        const summarizeServiceCartao = new SummarizeServiceCartao();
        const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
        const globalState = GlobalState.getInstance();
        const condicao = globalState.getClientCondition();
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
            `\u{1F4B6}Para cadastrar um cartão, digite ou fale os detalhes:
*Nome da cartão*
*tipo*
*banco*
*limite*
*saldo*`);
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
            await sendMessage(To, From, `\u{1F4B6}Para cadastrar um cartão, digite ou fale os detalhes:
*Nome da cartão*
*tipo*
*banco*
*limite*
*saldo* `);
            await atualizarEstado(From, "aguardando_dados");
        }

        if (estadoAtual === "aguardando_dados") {
            const Transcribe = await transcribe(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
            if (!Transcribe) return;

            const response = await summarizeServiceCartao.summarize(Transcribe);
            let [nome_cartao, tipo, banco, limite, saldo] = response.split(',');
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
                    const formatLimiteValor = formatWithRegex(limiteValor);
                    const formatSaldoValor = formatWithRegex(saldoValor);
                    globalState.setClientCondition("cartao_1");
                    const dadosMsg = ` \u{1F4B5}Cartão: *${newNomeCartao.trim()}*, *Tipo:${newTipo.trim()}*, *Banco:${newBanco.trim()}*, *Limite:${formatLimiteValor}*, *Saldo:${formatSaldoValor}*`
                    await atualizarEstado(From, "aguardando_confirmacao_dados");
                    sendConfirmPadraoMessage(To, From, dadosMsg); 
                }
            } catch (error) {
                console.log("Erro em aguardando dados", error);
                await sendMessage(To, From, "Detectamos um erro ao cadastrar o cartão. Por favor, tente novamente.");
            }
        }

        if (estadoAtual === 'aguardando_confirmacao_dados') {
            
        let dados = globalState.getMensagem();
        if(!dados)return null
        
        let [nome_cartao, tipo, banco, limite, saldo] = dados.split(',');

        if (Body.toUpperCase() === 'S' || Body.trim() === 'Sim')  {
            if(cliente){
                try {
                    const newNomeCartao = nome_cartao!.replace(/["'\[\]\(\)]/g, '');
                    const newTipo = tipo.replace(/["'\[\]\(\)]/g, '');
                    const newBanco = banco.replace(/["'\[\]\(\)]/g, '');
                    const limiteValor = parseFloat(limite);
                    const saldoValor = parseFloat(saldo);
                    const resultado = await cadastrarCartao(cliente, newNomeCartao, newTipo, newBanco, limiteValor, saldoValor);
                    
                    if (resultado?.sucesso) {
                        await sendMessage(To, From, `
                        *Cartão cadastrado com sucesso!* 
\u{1F4B6} *Cartão:* ${newNomeCartao.trim()}
\u{1F4F1} *tipo:* ${newTipo.trim()}
\u{1F3E6} *Banco:* ${newBanco.trim()}
\u{1F4B5} *Limite:*  ${formatWithRegex(limiteValor)}
\u{1FA99} *Saldo:* ${formatWithRegex(saldoValor)} \n
\u{1F4A1}Para cadastrar outro cartão digite *6*, para voltar digite *8*, ou para sair digite *9*`);
                                            
                        await limparEstado(From);
                        globalState.setClientCondition("inicial");
                    } else {
                        console.error("erro ao salvar cartão", resultado);

                        await limparEstado(From);
                        globalState.setClientCondition("inicial");
                        await sendMessage(To, From, "Houve um erro ao cadastrar o cartão. Para tentar novamente digite *6* ou para sair digite *9*.");
                    }  
                } catch (error) {
                    console.log("...ERRRROR>>>", error);
                    await limparEstado(From);
                    globalState.setClientCondition("inicial");
                    await sendMessage(To, From, "Ops. Houve um erro ao cadastrar o cartão. Para tentar novamente digite *6* ou para sair digite *9*.");
                }
            }
                
        } else if (Body.toUpperCase() === 'N' || Body.trim() === 'Não') {
            await sendMessage(To, From, "Cadastro de cartão cancelado. Você pode tentar novamente.");
            await atualizarEstado(From, "aguardando_dados");
        } else {
            await sendMessage(To, From, "Não reconheci sua resposta. Por favor, responda com *Sim* ou *Não*.");
        }
    }
    };
}