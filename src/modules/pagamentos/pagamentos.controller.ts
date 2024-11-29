import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { sendMessage, sendConfirmPadraoMessage } from '../../infra/integrations/twilio';
import '../../commands';
import { formatarNumeroTelefone } from '../../utils/trata-telefone';
import { formatWithRegex } from '../../utils/formata-dinheiro';
import { cadastrarPagamento } from './pagamentos.repository';
import { validarDescricao, validarValorTotal } from '../../utils/validation';
import { criarClientePorTelefone } from '../clientes/clientes.repository';
import { verificarEstado, atualizarEstado, limparEstado, verificarClienteEstado } from '../../infra/states/states';
import { transcribe } from '../transcribe/transcribe.controler';
import { SummarizeServiceMeta } from '../../infra/integrations/summarize.service';
import dayjs from 'dayjs';
import { GlobalState } from '../../infra/states/global-state';
dotenv.config();
import { SummarizeServiceReceitas } from '../../infra/integrations/summarize.service';
import { MercadoPagoConfig, Preference, PreApproval } from "mercadopago";


export class Pagamentos {

    
    pagamentoWhatsapp = async (req: Request, res: Response) => {
        //const summarizeServiceReceitas = new SummarizeServiceReceitas();
        const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
        const globalState = GlobalState.getInstance();
        //const mensagem = globalState.getMensagem();
        const condicao = globalState.getClientCondition();
        const cliente_id = await criarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));

        if (condicao == "pagamento") {
            await atualizarEstado(From, "aguardando_dados");
        }

        const cliente = verificarClienteEstado(cliente_id);
        const estadoAtual = await verificarEstado(From);


        //////////////////////////////////////////////////////////////

        if (Body == 'Não' || Body == 'não' || Body == 'N' || Body == 'n') {
            globalState.setClientCondition("pagamento_1");
            await sendMessage(To, From, "\u{1F522}Para usufruir da nossa consultoria automática é necessário o pagamamento");
        }

        if (Body == 'Sim' || Body == 'sim' || Body == 'S' || Body == 's') {
            await sendMessage(To, From, `\u{1F4B5}Para prosseguir com o pagamento favor clicar no link:\n 
                https://vanessafonsecaoficial.com
            `);
            //await atualizarEstado(From, "aguardando_dados");
        }


    };


    pagamentoLink = async (req: Request, res: Response) => {
        
        const client = new MercadoPagoConfig({
            accessToken: "APP_USR-270301395499319-112708-ac1aabf42bf66fe097a5d0fe848a59eb-261055563", // Substitua pelo seu Access Token do Mercado Pago
          });
          const preference = new Preference(client);

        try {
            const { id, title, unit_price, quantity } = req.body;

            // Validação básica dos campos
            if (!id || !title || !unit_price || !quantity) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            const body = {
                items: [
                    {
                        id: id, // Identificador único do item
                        title: title, // Nome do item
                        unit_price: unit_price, // Preço unitário
                        quantity: quantity, // Quantidade
                    },
                ],
                back_urls: {
                    success: "https://www.seusite.com/success", // URL em caso de sucesso
                    failure: "https://www.seusite.com/failure", // URL em caso de falha
                    pending: "https://www.seusite.com/pending", // URL para pendente
                },
                auto_return: "approved", // Retorno automático ao sucesso
            };

            // Criação do link de pagamento
            const response = await preference.create({ body });

            // Retorna o link gerado
            console.log("response.....", response);
            res.json({
                init_point: response, // URL do link de pagamento
            });
        } catch (error) {
            console.error("error", error);
            res.status(500).json({ error: "Failed to create payment link" });
        }

    };





    pagamentoRecorrente = async (req: Request, res: Response) => {
        
        const client = new MercadoPagoConfig({
            accessToken: "APP_USR-270301395499319-112708-ac1aabf42bf66fe097a5d0fe848a59eb-261055563", // Substitua pelo seu Access Token do Mercado Pago
          });

          const preapproval = new PreApproval(client);
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
        
            if (!payer_email || !reason || !amount || !frequency || !frequency_type || !start_date || !end_date || !back_url) {
              return res.status(400).json({ error: "Missing required fields" });
            }
        
            const response = await preapproval.create({
              body: {
                payer_email,
                reason,
                auto_recurring: {
                  frequency,
                  frequency_type,
                  transaction_amount: amount,
                  currency_id: "BRL",
                  start_date,
                  end_date,
                },
                back_url,
              },
            });
        
            return res.status(201).json(response);
          } catch (error) {
            return res.status(400).json({ error: "Erro ao criar assinatura", details: error });
          }
        };
}