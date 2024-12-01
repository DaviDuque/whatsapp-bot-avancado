import { Router } from 'express';
import { TransacoesController } from '../modules/transacoes/transacoes.controller';

const router = Router();

router.post('/avulso', TransacoesController.criarPagamentoAvulso);
router.post('/assinatura', TransacoesController.criarAssinatura);
router.put('/assinatura/:id', TransacoesController.atualizarAssinatura);
router.put('/:id', TransacoesController.atualizarPagamento);
router.delete('/:id', TransacoesController.cancelarPagamento);

export default router;