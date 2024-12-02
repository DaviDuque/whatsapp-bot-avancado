import { Request, Response } from 'express';
import { TransacoesService } from './transacoes.service';

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
};
