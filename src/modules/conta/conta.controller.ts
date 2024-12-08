import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { sendMessage, sendConfirmPadraoMessage } from '../../infra/integrations/twilio';
import '../../commands';
import { formatarNumeroTelefone } from '../../utils/trata-telefone';
import { cadastrarConta } from './conta.repository';
import { validarDescricao, validarValorTotal } from '../../utils/validation';
import { formatWithRegex } from '../../utils/formata-dinheiro';
import { criarClientePorTelefone } from '../clientes/clientes.repository';
import { verificarEstado, atualizarEstado, limparEstado,  verificarClienteEstado } from '../../infra/states/states';
import { transcribe } from '../transcribe/transcribe.controler';
import { SummarizeServiceConta } from '../../infra/integrations/summarize.service';
import { GlobalState } from '../../infra/states/global-state';

export class Conta {
    whatsapp = async (req: Request, res: Response) => {
        const summarizeServiceConta = new SummarizeServiceConta();
        const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
        const globalState = GlobalState.getInstance();
        const mensagem = globalState.getMensagem();
        const condicao = globalState.getClientCondition();

        const cliente_id = await criarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));
        
        if(condicao == "conta"){
            await atualizarEstado(From, "aguardando_dados");
        }

        const cliente = verificarClienteEstado(cliente_id);
        const estadoAtual = await verificarEstado(From);

        if((estadoAtual == 'aguardando_continuacao' && Body =='N') || (estadoAtual == 'aguardando_continuacao' && Body =='n') ){
                globalState.setClientCondition("inicial");
                await sendMessage(To, From, "\u{1F4F1} Digite \u{0038}\u{FE0F}\u{20E3} para ver o menu");
        }

        if((estadoAtual == 'aguardando_continuacao' && Body =='S') || (estadoAtual == 'aguardando_continuacao' && Body =='s') ){
                await sendMessage(To, From, 
                    `\u{1F3E6} Para cadastrar uma conta bancária, digite ou fale os detalhes:
*Nome da conta*
*tipo:* Corrente/poupança
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
                await sendMessage(To, From, "\u{26A0}Não reconheci seu comando,Para cadastrar outra conta digite 'S' ou voltar digite 'N'.");
            }

        if (!estadoAtual) {
            await sendMessage(To, From, `\u{1F3E6} Para cadastrar uma conta bancária, digite ou fale os detalhes:
*Nome da conta*
*Tipo:* Corrente/poupança
*Banco*
*Limite*
*Saldo*
                     `);
            await atualizarEstado(From, "aguardando_dados");
        }

        if (estadoAtual === "aguardando_dados") {
            const Transcribe = await transcribe(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
            if (!Transcribe) return;

            const response = await summarizeServiceConta.summarize(Transcribe);         
            let [nome_conta, tipo, banco, limite, saldo] = response.split(',');
           
            const limiteValor = parseFloat(limite);
            const saldoValor = parseFloat(saldo);
            if (!cliente) { return undefined; }
            globalState.setMensagem(`${response}`);

            try {
                const newNomeConta = nome_conta.replace(/["'\[\]\(\)]/g, '');
                const newTipo = tipo.replace(/["'\[\]\(\)]/g, '');
                const newBanco = banco.replace(/["'\[\]\(\)]/g, '');
                
                if (!validarDescricao(nome_conta) || !validarValorTotal(limiteValor) || !validarValorTotal(saldoValor) || newNomeConta == null) {
                    await sendMessage(To, From, "\u{26A0}Desculpe não entendi, forneça os dados corretos da conta. Você pode digitar ou falar");
                } else {
                    globalState.setClientCondition("conta_1");
                    const formatLimiteValor = formatWithRegex(limiteValor);
                    const formatSaldoValor = formatWithRegex(saldoValor);
     
                    await atualizarEstado(From, "aguardando_confirmacao_dados");
                    const dadosMsg = 
`\u{1F4B5}Conta: *${newNomeConta.trim()}*, *tipo:${newTipo.trim()}*, *Banco:${newBanco.trim()}*, *Limite:${formatLimiteValor}*, *Saldo:${formatSaldoValor}*`
                    sendConfirmPadraoMessage(To, From, dadosMsg); 
                }
            } catch (error) {
                console.log("erro cadastro contas", error);
                await sendMessage(To, From, "\u{274C}Houve um erro ao cadastrar a conta. Por favor, tente novamente.");
            }
        }

        if (estadoAtual === 'aguardando_confirmacao_dados') {

        let dados = globalState.getMensagem();
        if(!dados)return null
        let [nome_conta, tipo, banco, limite, saldo] = dados.split(',');

            if (Body.toUpperCase() === 'S' || Body.trim() === 'Sim') {
                if(cliente){
                    try {
                        const newNomeConta = nome_conta!.replace(/["'\[\]\(\)]/g, '');
                        const newTipo = tipo.replace(/["'\[\]\(\)]/g, '');
                        const newBanco = banco.replace(/["'\[\]\(\)]/g, '');
                        const limiteValor = parseFloat(limite);
                        const saldoValor = parseFloat(saldo);
                        const formatLimiteValor = formatWithRegex(limiteValor);
                        const formatSaldoValor = formatWithRegex(saldoValor);
                        const resultado = await cadastrarConta(cliente, newNomeConta, newTipo, newBanco, limiteValor, saldoValor);
        
                        if (resultado?.sucesso) {
                            await sendMessage(To, From, `
*Conta cadastrada com sucesso!* 
*Conta:* ${newNomeConta.trim()}
*Tipo:* ${newTipo.trim()}
*Banco:* ${newBanco.trim()}
*Limite:*  ${formatLimiteValor}
*Saldo:* ${formatSaldoValor} \n
\u{1F4A1}Para cadastrar outra Conta digite *7*, para voltar digite *8* ou para sair digite *9*`);
                                        
                                await limparEstado(From);
                                globalState.setClientCondition("inicial");
                }else {
                    console.error("erro ao salvar conta", resultado);
                    await limparEstado(From);
                    globalState.setClientCondition("inicial");
                    await sendMessage(To, From, "\u{274C}Houve um erro ao cadastrar a conta. Para tentar novamente digite *6* ou para sair digite *9*.");
                }      
                    } catch (error) {
                        await sendMessage(To, From, "\u{274C}Houve um erro ao cadastrar a conta. Por favor, tente novamente.");
                    }
                }
                
            } else if (Body.toUpperCase() === 'N' || Body.trim() === 'Não') {
                await sendMessage(To, From, "\u{274C}Cadastro de conta cancelado. Você pode tentar novamente.");
                await atualizarEstado(From, "aguardando_dados");
            } else {
                await sendMessage(To, From, "\u{26A0} Não reconheci sua resposta. Por favor, responda com 'Sim' para sim ou 'Não' para não.");
            }
        }
    };
}