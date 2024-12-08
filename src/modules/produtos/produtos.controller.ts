import { Request, Response } from 'express';
import { ProdutosService } from './produtos.service';

export class ProdutosController {
  private service: ProdutosService;

  constructor() {
    this.service = new ProdutosService();
  }

  async getTodosProdutos(req: Request, res: Response): Promise<void> {
    try {
      const produtos = await this.service.obterTodosProdutos();
      res.status(200).json(produtos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getProdutosPorGrupo(req: Request, res: Response): Promise<void> {
    try {
      const { grupo } = req.params;
      const produtos = await this.service.obterProdutosPorGrupo(grupo);
      res.status(200).json(produtos);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getTodosProdutosDireto(): Promise<any> {
    try {
      const produtos: any = await this.service.obterTodosProdutos();
      produtos.status = 'sucesso';
      return produtos;
    } catch (error: any) {
      return({ status: 'erro' , message: error.message });
    }
  }

  async getProdutosPorGrupoDireto(grupo: string): Promise<any> {
    try {
      const produtos: any = await this.service.obterProdutosPorGrupo(grupo);
      produtos.status = 'sucesso';
      return produtos;
    } catch (error: any) {
      console.error("errror>>>>", error);
      return({ status: 'erro' , message: error.message });
    }
  }
}
