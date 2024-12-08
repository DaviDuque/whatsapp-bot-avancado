import { Router } from 'express';
import { ProdutosController } from '../modules/produtos/produtos.controller';

const produtosController = new ProdutosController();
const router = Router();

router.get('/todos-produtos', (req, res) => produtosController.getTodosProdutos(req, res));
router.get('/grupo/:grupo', (req, res) => produtosController.getProdutosPorGrupo(req, res));

export default router;
