// receitas.repository.ts
import { connection } from '../../infra/database/mysql-connection';
import { Receita } from  '../../types/types';

export const buscarReceitasPorTelefone = async (telefone: string): Promise<Receita[]> => {
    const query = 'SELECT * FROM receitas WHERE telefone = ?';
    const [rows] = await connection.execute(query, [telefone]);
    return rows as Receita[];
};
