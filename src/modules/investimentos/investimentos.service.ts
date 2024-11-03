// receitas.service.ts
import { connection } from '../../infra/database/mysql-connection';
import dayjs from 'dayjs';

// Função para cadastrar uma nova receita
export const cadastrarInvestimentoService = async (id_cliente: string, descricao: string, valor: number, data_investimento: string,  tipo: string) => {
    try {
        const newDate: string = dayjs(data_investimento).format('YYYY-MM-DD HH:mm:ss');
        const query = 'INSERT INTO investimentos (id_cliente, descricao, valor, data_investimento, tipo) VALUES (?, ?, ?, ?, ?)';
        const values = [id_cliente, descricao, valor, newDate, tipo];
        await connection.execute(query, values);
    } catch (error) {
        console.error('Erro ao cadastrar investimentos:', error);
        throw error;
    }
};

