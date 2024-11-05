import { connection } from '../../infra/database/mysql-connection';
import dayjs from 'dayjs';


export const verificarCartaoPorCliente = async (cliente_id: number) => {
    try {
        const [rows]: any = await connection.query('SELECT * FROM cartoes WHERE cliente_id = ?', [cliente_id]);

        // Verificando se a consulta retornou algum resultado
        if (Array.isArray(rows) && rows.length > 0) {
            return true;
        }

        return false;
    } catch (error) {
        console.error('Erro ao verificar cartao:', error);
        throw error;
    }
};

export const cadastrarCartao = async (id_cliente: string, nome_cartao: string, tipo: string, banco: string,  limite?: number, saldo?: number) => {
    try {
        //const newDate: string = dayjs(data_despesa).format('YYYY-MM-DD HH:mm:ss');
        const query = 'INSERT INTO cartoes (id_cliente, nome_cartao, tipo, banco, limite, saldo) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [
            id_cliente,
            nome_cartao.trim(),
            tipo.trim(),
            banco.trim(),
            limite,
            saldo
        ];
        await connection.execute(query, values);
    } catch (error) {
        console.error('Erro ao cadastrar cartão:', error);
        throw error;
    }
};



export const verificarEstadoCartao = async (from: string) => {
    // Implementar lógica para verificar o estado atual do cadastro
};

export const atualizarEstadoCartao = async (from: string, estado: string) => {
    // Implementar lógica para atualizar o estado do cadastro
};

export const limparEstadoCartao = async (from: string) => {
    // Implementar lógica para limpar o estado do cadastro
};



