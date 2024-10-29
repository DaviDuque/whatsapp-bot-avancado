import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { sendMessage } from '../../infra/integrations/twilio';
import '../../commands';
import { formatarNumeroTelefone } from '../../utils/trata-telefone';
import { cadastrarDespesaController } from './despesas.service';
import { validarDescricao, validarValor, validarData } from '../../utils/validation';
import { verificaTipoMsg } from '../../utils/verifica-tipo-msg';
import { criarClientePorTelefone } from '../clientes/clientes.repository';
import { verificarEstado, atualizarEstado, limparEstado,  verificarClienteEstado } from '../../infra/states/states';
import { transcribe } from '../transcribe/transcribe.controler';
import { SummarizeServiceDespesas } from '../../infra/integrations/summarize.service';
import dayjs from 'dayjs';
import { GlobalState } from '../../infra/states/global-state';
// Armazenamento temporário para os dados da despesa em processo de cadastro
const dadosDespesasTemporarios: { [key: string]: any } = {};

export class Despesas {
    whatsapp = async (req: Request, res: Response) => {
        const summarizeServiceDespesas = new SummarizeServiceDespesas();
        const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
        const TipoMSG = verificaTipoMsg(NumMedia, MediaContentType0, MediaUrl0);
        const [...args] = Body.split(' ');
        const globalState = GlobalState.getInstance();
        const mensagem = globalState.getMensagem();
        const condicao = globalState.getClientCondition();
        console.log("variavel global--->", mensagem);

        const cliente_id = await criarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));
        
        if(condicao == "despesas"){
        await atualizarEstado(From, "aguardando_dados");
        }


        const cliente = verificarClienteEstado(cliente_id);

      
            const estadoAtual = await verificarEstado(From);

            if((estadoAtual == 'aguardando_continuaca' && Body =='N') || (estadoAtual == 'aguardando_continuaca' && Body =='n') ){
                globalState.setClientCondition("inicial");
                await sendMessage(To, From, "Digite 8 para ver o menu");
            }

            if((estadoAtual == 'aguardando_continuaca' && Body =='S') || (estadoAtual == 'aguardando_continuaca' && Body =='s') ){
                await sendMessage(To, From, "Para cadastrar uma despesa, envie os detalhes como: nome da despesa, data, dia, se é parcelado, onde foi");
                await atualizarEstado(From, "aguardando_dados");
            }

            if(estadoAtual == 'aguardando_continuaca' 
                && Body !='N' 
                && Body !='n' 
                && Body !='S' 
                && Body !='s'
              ){
                await sendMessage(To, From, "Não reconheci seu comando,Para cadastrar outra despesa digite 'S' ou voltar digite 'N'.");
            }
            
        
        

        if (!estadoAtual) {
            await sendMessage(To, From, "Para cadastrar uma despesa, envie os detalhes como: nome da despesa, data, dia, se é parcelado, onde foi");
            await atualizarEstado(From, "aguardando_dados");
        }

        if (estadoAtual === "aguardando_dados") {

            const Transcribe = await transcribe(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
            if (!Transcribe) return;

            const response = await summarizeServiceDespesas.summarize(Transcribe);
            console.log("transcribe---->", response);
     
            

    
            let [descricao, valorStr, dataStr, categoria, parcelado] = response.split(',');
            console.log("testeeeeee", descricao, valorStr, dataStr, categoria, parcelado);

   
    
            let dataString: string = dayjs(dataStr).format('YYYY-MM-DD');
            console.log("data formatada 1",  dataString);
            
            if(dataString == 'Invalid Date'){dataString = dayjs().format('YYYY-MM-DD')}
            console.log("data formatada 2",  dataString);
            const valor = parseFloat(valorStr);
            if(!cliente){return undefined}

            try{
                const newDescricao = descricao.replace(/["'\[\]\(\)]/g, '');
                const newCategoria = categoria.replace(/["'\[\]\(\)]/g, '');
                const newParcelado = parcelado.replace(/["'\[\]\(\)]/g, '');
            
 
            if (!validarDescricao(descricao) || !validarValor(valor) || !validarData(dataString) || newDescricao == null) {
                await sendMessage(To, From,"Desculpe não entendi, forneça os dados corretos da despesa. Você pode digitar ou falar");
               
            }else{
                
                    const resultado = await cadastrarDespesaController(cliente, newDescricao, valor, dataString, newCategoria, newParcelado);
                console.log("*****************:",  resultado);
                    await sendMessage(To, From, "Despesa cadastrada com sucesso! Para cadastrar outra despesa digite 'S' ou voltar digite 'N'.");
                    await atualizarEstado(From, "aguardando_continuaca");
                    //await limparEstado(From);
                    globalState.setClientCondition("despesas_2");
                    dataStr = "null";
                }
            } catch (error) {
                await sendMessage(To, From, "Houve um erro ao cadastrar a despesa. Por favor, tente novamente.");
            }
        }

        res.status(400).send("Estado não reconhecido.");
    }
}
