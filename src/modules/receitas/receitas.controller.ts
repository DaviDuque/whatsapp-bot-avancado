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
    const estadoAtual = await verificarEstado(From);

 
    const cliente_id = await criarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));
        const cliente = await verificarClienteEstado(cliente_id);
        console.log("cliente--->>", cliente)
        await atualizarEstado(From, "aguardando_dados");
        
        if (!estadoAtual) {
            //cliente = await criarClientePorTelefone(From);
            await atualizarEstado(From, 'aguardando_dados');
            await sendMessage(To, From, 'Para cadastrar uma receita, envie os detalhes como: nome da receita, data, dia, categoria:');
            
        }
        
        //const estadoAtual = await verificarEstado(From);
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
                console.log("data formatada 1",  dataString);
                
                if(dataString == 'Invalid Date'){dataString = dayjs().format('YYYY-MM-DD')}
                console.log("data formatada 2",  dataString);
                const valor = parseFloat(valorStr);
                if(!cliente){return undefined}

                const newDescricao = descricao.replace(/["'\[\]\(\)]/g, '');
                const newCategoria = categoria.replace(/["'\[\]\(\)]/g, '');
     
                if (!validarDescricao(descricao) || !validarValor(valor) || !validarData(dataString)) {
                    await sendMessage(To, From,"Desculpe não entendi, forneça os dados corretos da receita. Você pode digitar ou falar");
                   
                }else{
                    await cadastrarReceitaService(cliente, newDescricao, valor, dataString, newCategoria);
                    await sendMessage(To, From, "Receita cadastrada com sucesso!");
                    await limparEstado(From);
                    dataStr = "null";
                }
            }

        //res.sendStatus(200);
   
};
}