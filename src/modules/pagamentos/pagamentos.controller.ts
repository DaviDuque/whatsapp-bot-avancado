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
import { TransacoesService } from '../transacoes/transacoes.service';


export class Pagamentos {


  pagamentoWhatsapp = async (req: Request, res: Response) => {
    //const summarizeServiceReceitas = new SummarizeServiceReceitas();
    const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
    const globalState = GlobalState.getInstance();
    //const mensagem = globalState.getMensagem();
    const condicao = globalState.getClientCondition();
    const dadosCliente: any = await buscarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')))
    //const cliente_id = await criarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));

    if (condicao == "pagamento") {
      //await atualizarEstado(From, "aguardando_dados");
    }

    const cliente = verificarClienteEstado(dadosCliente.id_cliente);
    const email = await dadosCliente[0].email;
    const estadoAtual = await verificarEstado(From);
    console.log(">>>>>>email", email);
    console.log(">>>>>>email", dadosCliente);


    //////////////////////////////////////////////////////////////

    if (Body == 'Não' || Body == 'não' || Body == 'N' || Body == 'n') {
      globalState.setClientCondition("pagamento_1");
      await sendMessage(To, From, "\u{1F522} Para usufruir da nossa consultoria automática é necessário o pagamamento \n Enviamos uma notificação para administração. Entraremos em contato em breve");
    }

  

    else if (Body == 'Sim' || Body == 'sim' || Body == 'S' || Body == 's') {

    try {
      const dataUmAno = dayjs(new Date()).add(1, 'year').format('YYYY-MM-DD');

      const payer_email = await dadosCliente[0].email;
      const reason = "Assinatura Premium";
      const amount = 40.00;
      const frequency = 1;
      const frequency_type = "months";
      const start_date = dayjs(new Date()).toISOString();
      const end_date = dayjs(dataUmAno).toISOString();
      const back_url = "https://www.vanessafonsecaoficial.com/assinatura-finalizada";

      console.log("data", end_date);
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
      console.log(">>>>>>>>>>>>>response", response);
      if (response.status == 'sucesso') {

        const dadosAssinatura = {
          id_cliente: dadosCliente[0].id_cliente,
          id_produto: 1,
          id_tipo: "assinatura",
          meio_pagamento: null,
          valor: amount,
          valor_pago: amount,
          valor_total: amount,
          frequencia:frequency,
          frequencia_tipo: 1,
          data_inicio: dayjs(start_date.replace(/["'\[\]\(\)]/g, '')).format('YYYY-MM-DD'),
          data_fim: dayjs(end_date.replace(/["'\[\]\(\)]/g, '')).format('YYYY-MM-DD'),
          id_transacao_gateway: response.id,
          id_pagador_gateway: response.payer_id,
          id_loja_gateway: response.collector_id,
          id_aplicacao_gateway: response.application_id
        };

        const transacao = await TransacoesService.criarAssinatura(dadosAssinatura);
        console.log("transacai>>>>>>>", transacao);

        sendMessage(To, From, `pague por aqui ${response.init_point}`);
      } else {
        sendMessage(To, From, "\u{1F534} Erro ao criar assinatura, uma notificação foi enviada para o administrador, aguarde que entraremos em contato");
      }

    } catch (error) {
      console.log("errrrrrrrr", error);
      sendMessage(To, From, "\u{26A0} Erro ao criar assinatura, uma notificação foi enviada para o administrador, aguarde que entraremos em contato");
    }

  }
    else{
      globalState.setClientCondition("pagamento_1");
      await sendConfirmPadraoMessage(To, From, '\u{1F44D} Deseja receber novamente o link de pagamento?');;
    }
}



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




