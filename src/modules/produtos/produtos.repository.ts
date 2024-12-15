import { connection } from '../../infra/database/mysql-connection';

export class ProdutosRepository {
  async buscarTodos(): Promise<any[]> {
    const [rows]: any = await connection.query(
      'SELECT * FROM produtos WHERE status = 1'
    );
    return rows;
  }

  async buscarPorGrupo(grupo: string): Promise<any[]> {
    const [rows]: any = await connection.query(
      'SELECT * FROM produtos WHERE grupo = :grupo AND status = 1',
      { grupo }
    );
    console.log("rows>>>>>", rows);
    return rows;
  }
}
