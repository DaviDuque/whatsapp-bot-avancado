import { Request, Response } from 'express';
import { TransacoesService } from './transacoes.service';
import { modificarStatusCliente } from '../clientes/clientes.repository';

export const TransacoesController = {
    // Criar pagamento avulso
    async criarPagamentoAvulso(req: Request, res: Response) {
        try {
            const transacao = await TransacoesService.criarPagamentoAvulso(req.body);
            res.status(201).json(transacao);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async criarPagamentoAvulsoDireto(dados: any) {
        try {
            const transacao = await TransacoesService.criarPagamentoAvulso(dados);
            transacao.status = "sucesso";
            return transacao;
        } catch (error: any) {
            return({ status: "erro", error: error.message });
        }
    },

    async criarAssinatura(req: Request, res: Response) {
        try {
            const transacao = await TransacoesService.criarAssinatura(req.body);
            res.status(201).json(transacao);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // Atualizar assinatura
    async atualizarAssinatura(req: Request, res: Response) {
        try {
            const transacao = await TransacoesService.atualizarAssinatura(
                parseInt(req.params.id),
                req.body
            );
            res.status(200).json(transacao);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

     // Atualizar assinatura
     async atualizarStatusAssinatura(req: Request, res: Response) {
        console.log("transaçoes patch", req.body);
        try {
            const transacao = await TransacoesService.atualizarStatusAssinatura(
                parseInt(req.params.id),
                req.body
            );
            res.status(200).json(transacao);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // Atualizar pagamento
    async atualizarPagamento(req: Request, res: Response) {
        try {
            const transacao = await TransacoesService.atualizarPagamento(
                parseInt(req.params.id),
                req.body
            );
            res.status(200).json(transacao);
        } catch (error: any) {
            res.status(500).json({ error: error });
        }
    },

    // Cancelar pagamento
    async cancelarPagamento(req: Request, res: Response) {
        try {
            const transacao = await TransacoesService.cancelarPagamento(parseInt(req.params.id));
            res.status(200).json(transacao);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async webhook(req: Request, res: Response) {
        try {
          const { type, data } = req.body;
      
          console.log("Webhook recebido:", req.body);
      
          if (type === "preapproval") {
            const preapprovalId = data.id; // ID da assinatura enviada na notificação
            
            console.log(`corpo da assinatura recebida>>>>>>: ${req.body}`);
            console.log(`ID da assinatura recebida: ${preapprovalId}`);
    
            const atualizacliente = await modificarStatusCliente(preapprovalId);
            ////////////////////////////////
    
            console.log("retorno da atualização do cliente", atualizacliente);
            if(atualizacliente){
                res.status(200).send("Webhook recebido com sucesso!");
            }else{
                res.status(400).send("Ops! Erro ao atualizar");
            }
            ////////////////////////////////////
      
            // Aqui você pode implementar a lógica para salvar ou processar a notificação
            // Exemplo: Atualizar banco de dados com o status da assinatura
          }
      
          // Retornar status 200 para confirmar que a notificação foi recebida
          
        } catch (error) {
          console.error("Erro ao processar webhook:", error);
          res.status(500).send("Erro ao processar webhook");
        }
      }
};
