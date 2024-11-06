import { connection } from '../../infra/database/mysql-connection';
import dayjs from 'dayjs';


export const verificarContaPorCliente = async (cliente_id: number) => {
    try {
        const [rows]: any = await connection.query('SELECT * FROM contas WHERE cliente_id = ?', [cliente_id]);

        // Verificando se a consulta retornou algum resultado
        if (Array.isArray(rows) && rows.length > 0) {
            return true;
        }

        return false;
    } catch (error) {
        console.error('Erro ao verificar conta :', error);
        throw error;
    }
};

export const cadastrarConta = async (id_cliente: string, nome_conta: string, tipo: string, banco: string,  limite?: number, saldo?: number) => {
    try {
        //const newDate: string = dayjs(data_despesa).format('YYYY-MM-DD HH:mm:ss');
        const query = 'INSERT INTO contas (id_cliente, nome_conta, tipo, banco, limite, saldo) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [
            id_cliente,
            nome_conta.trim(),
            tipo.trim(),
            banco.trim(),
            limite,
            saldo
        ];
        await connection.execute(query, values);
    } catch (error) {
        console.error('Erro ao cadastrar conta:', error);
        throw error;
    }
};



export const verificarEstadoConta = async (from: string) => {
    // Implementar lógica para verificar o estado atual do cadastro
};

export const atualizarEstadoConta = async (from: string, estado: string) => {
    // Implementar lógica para atualizar o estado do cadastro
};

export const limparEstadoConta = async (from: string) => {
    // Implementar lógica para limpar o estado do cadastro
};



