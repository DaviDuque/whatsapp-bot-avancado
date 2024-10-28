// receitas.service.ts
import { connection } from '../../infra/database/mysql-connection';
import { Receita } from  '../../types/types';
import dayjs from 'dayjs';

// Função para cadastrar uma nova receita
export const cadastrarReceitaService = async (id_usuario: string, descricao: string, valor: number, data_receita: string,  categoria: string) => {
    try {
        const newDate: string = dayjs(data_receita).format('YYYY-MM-DD HH:mm:ss');
        const query = 'INSERT INTO receitas (id_usuario, descricao, valor, data_receita, categoria) VALUES (?, ?, ?, ?, ?)';
        const values = [id_usuario, descricao, valor, newDate, categoria];
        await connection.execute(query, values);
    } catch (error) {
        console.error('Erro ao cadastrar receita:', error);
        throw error;
    }
};
