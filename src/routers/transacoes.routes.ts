import { Router } from 'express';
import { TransacoesController } from '../modules/transacoes/transacoes.controller';

const router = Router();

router.post('/avulso', TransacoesController.criarPagamentoAvulso);
router.post('/assinatura', TransacoesController.criarAssinatura);
router.put('/assinatura/:id', TransacoesController.atualizarAssinatura);
router.put(':id', TransacoesController.atualizarPagamento);
router.patch('/assinatura/:id', TransacoesController.atualizarStatusAssinatura);
router.delete('/:id', TransacoesController.cancelarPagamento);
router.post('/webhook', TransacoesController.webhook);

export default router;
