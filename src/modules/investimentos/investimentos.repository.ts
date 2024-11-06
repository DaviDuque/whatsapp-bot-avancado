// receitas.repository.ts
import { connection } from '../../infra/database/mysql-connection';
import { Receita } from  '../../types/types';

export const buscarInvestimentosPorTelefone = async (telefone: string): Promise<Receita[]> => {
    const query = 'SELECT * FROM receitas WHERE telefone = ?';
    const [rows] = await connection.execute(query, [telefone]);
    return rows as Receita[];
};


export const ListarInvestimentosPorCliente = async (id_cliente: string, startDate: string, endDate: string) => {
    try {
        const [rows]: any = await connection.query( `SELECT 'investimentos' AS Investimentos, id_cliente, descricao, valor, data_investimento AS data, tipo 
         FROM investimentos 
         WHERE id_cliente = ? and data_investimento BETWEEN ? AND ?`,  
           [id_cliente, startDate, endDate]
       );
       console.log("rows", rows);
            return  rows;
    }catch (error) {
        console.error('Erro ao verificar despesa:', error);
        throw error;
    }
}
