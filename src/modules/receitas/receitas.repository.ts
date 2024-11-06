// receitas.repository.ts
import { connection } from '../../infra/database/mysql-connection';
import { Receita } from  '../../types/types';

export const buscarReceitasPorTelefone = async (telefone: string): Promise<Receita[]> => {
    const query = 'SELECT * FROM receitas WHERE telefone = ?';
    const [rows] = await connection.execute(query, [telefone]);
    return rows as Receita[];
};


export const ListarReceitasPorCliente = async (id_cliente: string, startDate: string, endDate: string) => {
    try {
        const [rows]: any = await connection.query( `SELECT descricao, valor, data_receita AS data, categoria FROM receitas
         WHERE id_cliente = ? AND data_receita BETWEEN ? AND ?`,  
           [id_cliente, startDate, endDate]
       );
       console.log("rows", rows);
            return  rows;
    }catch (error) {
        console.error('Erro ao verificar despesa:', error);
        throw error;
    }
}