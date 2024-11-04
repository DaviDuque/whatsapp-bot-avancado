import { connection } from '../../infra/database/mysql-connection';
import dayjs from 'dayjs';


export const verificarDespesaPorUsuario = async (userId: number) => {
    try {
        const [rows]: any = await connection.query('SELECT * FROM despesas WHERE userId = ?', [userId]);

        // Verificando se a consulta retornou algum resultado
        if (Array.isArray(rows) && rows.length > 0) {
            return true;
        }

        return false;
    } catch (error) {
        console.error('Erro ao verificar despesa:', error);
        throw error;
    }
};

export const cadastrarDespesa = async (id_cliente: string, descricao: string, valor: number, data_despesa: string,  categoria?: string, parcelado?: string) => {
    try {
        const newDate: string = dayjs(data_despesa).format('YYYY-MM-DD HH:mm:ss');
        const query = 'INSERT INTO despesas (id_cliente, descricao, valor, data_despesa, categoria, parcelado) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [
            id_cliente,
            descricao.trim(),
            valor,
            newDate,
            categoria ? categoria.trim() : null,
            parcelado ?parcelado.trim() : 'n'
        ];
        await connection.execute(query, values);
    } catch (error) {
        console.error('Erro ao cadastrar receita:', error);
        throw error;
    }
};



export const verificarEstadoDespesa = async (from: string) => {
    // Implementar lógica para verificar o estado atual do cadastro
};

export const atualizarEstadoDespesa = async (from: string, estado: string) => {
    // Implementar lógica para atualizar o estado do cadastro
};

export const limparEstadoDespesa = async (from: string) => {
    // Implementar lógica para limpar o estado do cadastro
};



