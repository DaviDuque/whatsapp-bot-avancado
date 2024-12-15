// receitas.service.ts
import { connection } from '../../infra/database/mysql-connection';
import dayjs from 'dayjs';

// Função para cadastrar uma nova receita
export const cadastrarReceitaService = async (id_cliente: string, descricao: string, valor: number, data_receita: string,  categoria: string) => {
    try {
        const newDate: string = dayjs(data_receita).format('YYYY-MM-DD HH:mm:ss');
        const query = 'INSERT INTO receitas (id_cliente, descricao, valor, data_receita, categoria) VALUES (?, ?, ?, ?, ?)';
        const values = [id_cliente, descricao.trimStart(), valor, newDate, categoria];
        await connection.execute(query, values);
    } catch (error) {
        console.error('Erro ao cadastrar receita:', error);
        throw error;
    }
};
