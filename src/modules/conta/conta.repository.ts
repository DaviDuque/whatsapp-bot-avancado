import { connection } from '../../infra/database/mysql-connection';


export const verificarContaPorCliente = async (cliente_id: number) => {
    try {
        const [rows]: any = await connection.query('SELECT * FROM contas WHERE cliente_id = ?', [cliente_id]);
        if (Array.isArray(rows) && rows.length > 0) {
            return true;
        }

        return false;
    } catch (error) {
        console.error('Erro ao verificar conta :', error);
        throw error;
    }
};



export const cadastrarConta = async (
    id_cliente: string,
    nome_conta: string,
    tipo: string,
    banco: string,
    limite?: number,
    saldo?: number
): Promise<{ sucesso: boolean; mensagem: string }> => {
    try {
        const query = 'INSERT INTO contas (id_cliente, nome_conta, tipo, banco, limite, saldo) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [
            id_cliente,
            nome_conta.trim(),
            tipo.trim(),
            banco.trim(),
            limite || null,
            saldo || null
        ];
        await connection.execute(query, values);

        return { sucesso: true, mensagem: 'Conta cadastrado com sucesso.' };
    } catch (error: any) {
        console.error('Erro ao cadastrar conta:', error);
        return { sucesso: false, mensagem: `Erro ao cadastrar conta: ${error.message}` };
    }
};

