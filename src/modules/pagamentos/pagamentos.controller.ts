import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { sendMessage, sendConfirmPadraoMessage } from '../../infra/integrations/twilio';
import '../../commands';
import { formatarNumeroTelefone } from '../../utils/trata-telefone';
import { formatWithRegex } from '../../utils/formata-dinheiro';
import { cadastrarPagamento } from './pagamentos.repository';
import { validarDescricao, validarValorTotal } from '../../utils/validation';
import { criarClientePorTelefone, buscarClientePorTelefone } from '../clientes/clientes.repository';
import { verificarEstado, atualizarEstado, limparEstado, verificarClienteEstado } from '../../infra/states/states';
import { transcribe } from '../transcribe/transcribe.controler';
import { SummarizeServiceMeta } from '../../infra/integrations/summarize.service';
import dayjs from 'dayjs';
import { GlobalState } from '../../infra/states/global-state';
dotenv.config();
import { SummarizeServiceReceitas } from '../../infra/integrations/summarize.service';
import { MercadoPagoConfig, Preference, PreApproval } from "mercadopago";
import { processaAssinatura, processaPagamento } from "./pagamentos.service";


export class Pagamentos {


  pagamentoWhatsapp = async (req: Request, res: Response) => {
    //const summarizeServiceReceitas = new SummarizeServiceReceitas();
    const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
    const globalState = GlobalState.getInstance();
    //const mensagem = globalState.getMensagem();
    const condicao = globalState.getClientCondition();
    const dadosCliente: any = buscarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')))
    //const cliente_id = await criarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));

    if (condicao == "pagamento") {
      //await atualizarEstado(From, "aguardando_dados");
    }

    const cliente = verificarClienteEstado(dadosCliente.id_cliente);
    const email = dadosCliente.email;
    const estadoAtual = await verificarEstado(From);
    


    //////////////////////////////////////////////////////////////

    if (Body == 'Não' || Body == 'não' || Body == 'N' || Body == 'n') {
      globalState.setClientCondition("pagamento_1");
      await sendMessage(To, From, "\u{1F522}Para usufruir da nossa consultoria automática é necessário o pagamamento");
    }

    if (Body == 'Sim' || Body == 'sim' || Body == 'S' || Body == 's') {

      try {
        
          const payer_email = email;
          const reason = "rasão";
          const amount= 1;
          const frequency=12;
          const frequency_type="amount";
          const start_date = "";
          const end_date="";
          const back_url="";
        
  
        const response: any = await processaAssinatura(
          payer_email,
          reason,
          amount,
          frequency,
          frequency_type,
          start_date,
          end_date,
          back_url
        );
        console.log(">>>>>>>>>>>>>", response);
     if(response.dtatus == 'sucesso'){
      sendMessage(To, From, `\u{1F4B5} paghe por aqui ${response.init_point}`);
     }else{
      sendMessage(To, From, "Erro ao criar assinatura");
     }
       
      } catch (error) {
        sendMessage(To, From, "Erro ao criar assinatura");
      }


     /* await sendMessage(To, From, `\u{1F4B5}Para prosseguir com o pagamento favor clicar no link:\n 
                ${response.init_point}
            `);*/
      //await atualizarEstado(From, "aguardando_dados");
    }


  };



  pagamentoLink = async (req: Request, res: Response) => {
    try {
      const { id,
        title,
        unit_price,
        quantity
      } = req.body;

      const response = await processaPagamento(
        id,
        title,
        unit_price,
        quantity
      );

      return res.json(
        response
      );
    } catch (error) {
      console.error("error", error);
      res.status(500).json({ error: "Failed to create payment link" });
    }

  };


  pagamentoRecorrente = async (req: Request, res: Response) => {
    try {
      const {
        payer_email,
        reason,
        amount,
        frequency,
        frequency_type,
        start_date,
        end_date,
        back_url,
      } = req.body;

      const response = await processaAssinatura(
        payer_email,
        reason,
        amount,
        frequency,
        frequency_type,
        start_date,
        end_date,
        back_url
      );
      console.log(">>>>>>>>>>>>>", response);

      return res.status(201).json(response);
    } catch (error) {
      return res.status(400).json({ error: "Erro ao criar assinatura", details: error });
    }
  };


  /*Whebhook = async (req: Request, res: Response) => {
    try {
      const event = req.body;
  
      console.log("Notificação recebida:", event);
  
      // Verifique o tipo de evento
      if (event.type === "preapproval") {
        const preapprovalId = event.data.id;
  
        // Consulte o Mercado Pago para obter detalhes da assinatura
        const preApprovalDetails = await preApproval.get({ id: preapprovalId });
  
        // Salve os dados no banco de dados (exemplo com MongoDB ou outro banco)
        console.log("Detalhes da assinatura:", preApprovalDetails.body);
  
        // Exemplo: Verificar status da assinatura
        if (preApprovalDetails.body.status === "authorized") {
          console.log("Assinatura autorizada!");
          // Salvar no banco de dados
        }
      }
  
      res.status(200).send("OK");
    } catch (error) {
      console.error("Erro ao processar webhook:", error);
      res.status(500).send("Erro ao processar webhook");
    }
  };*/


}




