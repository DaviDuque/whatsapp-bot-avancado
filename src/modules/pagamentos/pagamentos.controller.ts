import * as dotenv from 'dotenv';
dotenv.config();
import dayjs from 'dayjs';
import { Request, Response } from 'express';
import { sendMessage, sendConfirmPadraoMessage, sendListPickerPlanos } from '../../infra/integrations/twilio';
import '../../commands';
import { formatarNumeroTelefone } from '../../utils/trata-telefone';
import { buscarClientePorTelefone,atualizarStatusCliente } from '../clientes/clientes.repository';
import { verificarEstado, atualizarEstado, verificarClienteEstado } from '../../infra/states/states';
import { GlobalState } from '../../infra/states/global-state';
import { processaAssinatura, processaPagamento } from "./pagamentos.service";
import { TransacoesController } from '../transacoes/transacoes.controller';
import { TransacoesService } from '../transacoes/transacoes.service';
import { ProdutosController } from '../produtos/produtos.controller';

export class Pagamentos {
  pagamentoWhatsapp = async (req: Request, res: Response) => {
    const { Body, To, From } = req.body;
    const globalState = GlobalState.getInstance();
    const condicao = globalState.getClientCondition();
    const dadosCliente: any = await buscarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')))
    const produtosController = new ProdutosController();
    const listProdutos: any = await produtosController.getTodosProdutosDireto();
    let dados: any;

    if (condicao == "pagamento") {
      await atualizarEstado(From, "aguardando_dados");
    }

    const estadoAtual = await verificarEstado(From);

    if ((Body == 'Não' || Body == 'não' || Body == 'N' || Body == 'n') && estadoAtual == 'aguardando_dados') {
      globalState.setClientCondition("pagamento_1");
      await sendMessage(To, From, "\u{1F522} Para usufruir da nossa consultoria automática é necessário o pagamamento \n Enviamos uma notificação para administração. Entraremos em contato em breve");
    }

    if ((Body == 'Sim' || Body == 'sim' || Body == 'S' || Body == 's') && estadoAtual == 'aguardando_dados') {
      globalState.setClientCondition("pagamento_1");
      await atualizarEstado(From, "aguardando_continuacao");
      await sendListPickerPlanos(To, From, `${listProdutos[0].valor}`, `${listProdutos[1].valor}`, `${listProdutos[2].valor}`, `${listProdutos[3].valor}`);
    }

    if (estadoAtual == "aguardando_continuacao") {
      switch (Body) {
        case "1":
          dados = await produtosController.getProdutosPorGrupoDireto('PPMU');
          break;
        case "2":
          dados = await produtosController.getProdutosPorGrupoDireto('PPMR');
          break;
        case "3":
          dados = await produtosController.getProdutosPorGrupoDireto('PPS');
          break;
        case "4":
          dados = await produtosController.getProdutosPorGrupoDireto('PPA');
          break;
        default:
          break;
      }
    }

    if (Body == '2' && estadoAtual == "aguardando_continuacao") {
      try {
        const dataUmAno = dayjs(new Date()).add(1, 'year').format('YYYY-MM-DD');
        const payer_email = await dadosCliente[0].email;
        const reason = dados[0].nome_produto;
        const amount = parseFloat(dados[0].valor);
        const frequency = 1;
        const frequency_type = "months";
        const start_date = dayjs(new Date()).toISOString();
        const end_date = dayjs(dataUmAno).toISOString();
        const back_url = "https://www.vanessafonsecaoficial.com/assinatura-finalizada";
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

        if (response.status == 'sucesso') {
          const dadosAssinatura = {
            id_cliente: dadosCliente[0].id_cliente,
            id_produto: dados[0].id_produto,
            id_tipo: "assinatura",
            meio_pagamento: null,
            valor: amount,
            valor_pago: amount,
            valor_total: amount,
            frequencia: frequency,
            frequencia_tipo: 1,
            data_inicio: dayjs(start_date.replace(/["'\[\]\(\)]/g, '')).format('YYYY-MM-DD'),
            data_fim: dayjs(end_date.replace(/["'\[\]\(\)]/g, '')).format('YYYY-MM-DD'),
            id_transacao_gateway: response.id,
            id_pagador_gateway: response.payer_id,
            id_loja_gateway: response.collector_id,
            id_aplicacao_gateway: response.application_id
          };
          const transacao = await TransacoesService.criarAssinatura(dadosAssinatura);
          /************Apagar essas 3 linhas e adicionar tratamento para pagamento */
          globalState.setClientId(dadosCliente[0].id_cliente);
          globalState.setClientCondition("inicial");
          await atualizarStatusCliente(dadosCliente[0].id_cliente);
          /***********************fim de improviso */
          sendMessage(To, From, `pague por aqui ${response.init_point}`);
        } else {
          sendMessage(To, From, "\u{1F534} Erro ao criar assinatura, uma notificação foi enviada para o administrador, aguarde que entraremos em contato");
        }
      } catch (error) {
        sendMessage(To, From, "\u{26A0} Erro ao criar assinatura, uma notificação foi enviada para o administrador, aguarde que entraremos em contato");
      }
    }
    else if ((Body == '1' || Body == '3' || Body == '4') && estadoAtual == "aguardando_continuacao") {
      const dadosPagamento: any = {
        id_cliente: dadosCliente[0].id_cliente,
        id_produto: dados[0].id_produto,
        meio_pagamento: null,
        valor: dados[0].valor,
        valor_pago: dados[0].valor,
        valor_total: dados[0].valor
      };

      try {
        const response: any = await processaPagamento(
          dados[0].id_produto,
          dados[0].nome_produto,
          parseFloat(dados[0].valor),
          1,
        );

        if (response.status == 'sucesso') {
           /************Apagar essas 3 linhas e adicionar tratamento para pagamento */
           globalState.setClientId(dadosCliente[0].id_cliente);
           globalState.setClientCondition("inicial");
           await atualizarStatusCliente(dadosCliente[0].id_cliente);
           /***********************fim de improviso */
          const transacao = await TransacoesController.criarPagamentoAvulsoDireto(dadosPagamento);
          sendMessage(To, From, `pague por aqui ${response.init_point.init_point}`);
        } else {
          sendMessage(To, From, "\u{1F534} Erro ao criar pagamento, uma notificação foi enviada para o administrador, aguarde que entraremos em contato");
        }
      } catch (error) {
        sendMessage(To, From, "\u{26A0} Erro ao criar pagamento, uma notificação foi enviada para o administrador, aguarde que entraremos em contato");
      }
    }
    else if((Body != '1' && Body != '2' && Body != '3' && Body != '4' && Body != 'Sim' && Body != 'Não') && estadoAtual != "aguardando_continuacao"){
      globalState.setClientCondition("pagamento_1");
      await sendConfirmPadraoMessage(To, From, '\u{1F44D} Deseja receber novamente o link de pagamento?');;
    }
  }

  pagamentoLink = async (req: Request, res: Response) => {
    try {
      const {
        id,
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
      return res.status(201).json(response);
    } catch (error) {
      return res.status(400).json({ error: "Erro ao criar assinatura", details: error });
    }
  };
}




