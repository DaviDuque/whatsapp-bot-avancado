// receitas.controller.ts
import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { sendMessage } from '../../infra/integrations/twilio';
import { formatarNumeroTelefone } from '../../utils/trata-telefone';
import { cadastrarReceitaService } from './receitas.service';
import { validarDescricao, validarValor, validarData } from '../../utils/validation';
import { verificaTipoMsg } from '../../utils/verifica-tipo-msg';
import { criarClientePorTelefone } from '../clientes/clientes.repository';
import { verificarEstado, atualizarEstado, limparEstado, verificarClienteEstado } from '../../infra/states/states';
import { GlobalState } from '../../infra/states/global-state';
import { transcribe } from '../transcribe/transcribe.controler';
import { SummarizeServiceReceitas } from '../../infra/integrations/summarize.service';
import dayjs from 'dayjs';

const dadosReceitasTemporarios: { [key: string]: any } = {};

// Função principal para processar mensagens relacionadas ao cadastro de receita
export class Receitas {
    processarMensagemReceita = async (req: Request, res: Response) => {
        const summarizeServiceReceitas = new SummarizeServiceReceitas();
        const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
        const telefone = formatarNumeroTelefone(From);
        const TipoMSG = verificaTipoMsg(NumMedia, MediaContentType0, MediaUrl0);
        const globalState = GlobalState.getInstance();
        const mensagem = globalState.getMensagem();
        const condicao = globalState.getClientCondition();
        console.log("variavel global--->", mensagem);


        const cliente_id = await criarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));

         
        if(condicao == "receitas"){
            await atualizarEstado(From, "aguardando_dados");
        }

        const cliente = verificarClienteEstado(cliente_id);
        const estadoAtual = await verificarEstado(From);
       
        if((estadoAtual == 'aguardando_continuacao' && Body =='N') || (estadoAtual == 'aguardando_continuacao' && Body =='n') ){
            globalState.setClientCondition("inicial");
            await sendMessage(To, From, "Digite 8 para ver o menu");
        }

        if((estadoAtual == 'aguardando_continuacao' && Body =='S') || (estadoAtual == 'aguardando_continuacao' && Body =='s') ){
            await sendMessage(To, From, "Para cadastrar uma receita, digite ou fale os detalhes como: nome da receita, data, dia, onde foi");
            await atualizarEstado(From, "aguardando_dados");
        }

        if(estadoAtual == 'aguardando_continuacao' 
            && Body !='N' 
            && Body !='n' 
            && Body !='S' 
            && Body !='s'
          ){
            await sendMessage(To, From, "Não reconheci seu comando,Para cadastrar outra receita digite 'S' ou voltar digite 'N'.");
        }
        


        if (!estadoAtual) {
            await atualizarEstado(From, 'aguardando_dados');
            await sendMessage(To, From, 'Para cadastrar uma receita, envie os detalhes como: nome da receita, data, dia, categoria:');

        }

      

        console.log("estadoAtual--->>", estadoAtual)
        // Processamento baseado no estado atual da conversa
        if (estadoAtual === 'aguardando_dados') {



            const Transcribe = await transcribe(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
            if (!Transcribe) return;

            const response = await summarizeServiceReceitas.summarize(Transcribe);
            console.log("transcribe---->", response);

            let [descricao, valorStr, dataStr, categoria] = response.split(',');
            console.log("testeeeeee", descricao, valorStr, dataStr, categoria);

            let dataString: string = dayjs(dataStr).format('YYYY-MM-DD');
            console.log("data formatada 1", dataString);

            if (dataString == 'Invalid Date') { dataString = dayjs().format('YYYY-MM-DD') }
            console.log("data formatada 2", dataString);

            const valor = parseFloat(valorStr);
            if (!cliente) { return undefined }

            globalState.setMensagem(`${response}`);

            try {
                const newDescricao = descricao.replace(/["'\[\]\(\)]/g, '');
                const newCategoria = categoria.replace(/["'\[\]\(\)]/g, '');

                if (!validarDescricao(descricao) || !validarValor(valor) || !validarData(dataString)) {
                    await sendMessage(To, From, "Desculpe não entendi, forneça os dados corretos da receita. Você pode digitar ou falar");

                } else {
                    //const resultado = await cadastrarReceitaService(cliente, newDescricao, valor, dataString, newCategoria);
                    //console.log("*****************:",  resultado);
                    globalState.setClientCondition("receitas_1");
                    // Solicitar confirmação dos dados
                    const confirmationMessage =`Por favor, confirme os dados abaixo:\n 
\u{1F4B5} *Receita:* ${newDescricao.trim()}
\u{1F4B0} *Valor:* ${valor}
\u{231A} *Data:* ${dayjs(dataString).format('DD-MM-YYYY')} \n
É correto? Responda com 'S' para sim ou 'N' para não.`;
                    await atualizarEstado(From, "aguardando_confirmacao_dados");
                    await sendMessage(To, From, confirmationMessage);
                }
            } catch (error) {
                console.log("999999", error);
                await sendMessage(To, From, "Houve um erro ao cadastrar a receita. Por favor, tente novamente.");
            }
        }




        if (estadoAtual === 'aguardando_confirmacao_dados') {
            

            let dados = globalState.getMensagem();
            console.log(">>>>>>>>>", dados);
            if(!dados)return null
            let [descricao, valorStr, dataStr, categoria] = dados.split(',');
    
            console.log(">>>>>>>>>Body", Body.toUpperCase());
                if (Body.toUpperCase() === 'S') {
                    console.log(">>>>>>>>>Bcliente", cliente);
                    if(cliente){
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
    
                  
    
                            // Se o usuário confirmar, salvar a despesa no banco
                    const resultado = await cadastrarReceitaService(cliente, newDescricao, valor, dataString, newCategoria);
                    console.log("*****************:", resultado);
                    
                    await sendMessage(To, From, `Receita cadastrada com sucesso \u{1F60E}! 
    \u{1F4B5} Receita: ${newDescricao}
    \u{1F4B0} Valor: ${valor}
    \u{231A} Data: ${dayjs(dataString).format('DD-MM-YYYY')}
    \u{1F4A1}Para cadastrar outra receita digite *2* ou voltar digite *8*.`);
                    
                    await limparEstado(From);
                    globalState.setClientCondition("inicial");
                            
                        } catch (error) {
                            console.log("error>>>>", error);
                            await sendMessage(To, From, "Houve um erro ao cadastrar a receita. Por favor, tente novamente.");
                        }
                    }
                    
                } else if (Body.toUpperCase() === 'N') {
                    // Se o usuário não confirmar, voltar ao estado anterior
                    await sendMessage(To, From, "Cadastro de receita cancelado. Você pode tentar novamente.");
                    await atualizarEstado(From, "aguardando_dados");
                } else {
                    await sendMessage(To, From, "Não reconheci sua resposta. Por favor, responda com 'S' para sim ou 'N' para não.");
                }
            }

        //res.sendStatus(200);

    };
}