import { ProdutosRepository } from './produtos.repository';

export class ProdutosService {
  private repository: ProdutosRepository;

  constructor() {
    this.repository = new ProdutosRepository();
  }

  async obterTodosProdutos(): Promise<any[]> {
    return await this.repository.buscarTodos();
  }

  async obterProdutosPorGrupo(grupo: string): Promise<any[]> {
    if (!grupo) {
      throw new Error('Grupo não pode ser vazio.');
    }
    return await this.repository.buscarPorGrupo(grupo);
  }
}
