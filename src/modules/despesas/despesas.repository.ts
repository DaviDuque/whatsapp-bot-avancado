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


export const cadastrarDespesa = async (id_usuario: string, descricao: string, valor: number, data_despesa: string, categoria?: string, parcelado?: string) => {
    const newDate: string = dayjs(data_despesa).format('YYYY-MM-DD HH:mm:ss');
    const sql = 'INSERT INTO despesas (id_usuario, descricao, valor, data_despesa, categoria, parcelado) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [id_usuario, descricao, valor, newDate, categoria, parcelado];
    await connection.execute(sql, values);
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



