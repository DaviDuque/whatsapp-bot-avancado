import { connection } from '../../infra/database/mysql-connection';

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

export const cadastrarCartao = async (
    id_cliente: string,
    nome_cartao: string,
    tipo: string,
    banco: string,
    limite?: number,
    saldo?: number
): Promise<{ sucesso: boolean; mensagem: string }> => {
    try {
        const query = 'INSERT INTO cartoes (id_cliente, nome_cartao, tipo, banco, limite, saldo) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [
            id_cliente,
            nome_cartao.trim(),
            tipo.trim(),
            banco.trim(),
            limite || null,
            saldo || null
        ];

        await connection.execute(query, values);

        return { sucesso: true, mensagem: 'Cartão cadastrado com sucesso.' };
    } catch (error: any) {
        console.error('Erro ao cadastrar cartão:', error);
        return { sucesso: false, mensagem: `Erro ao cadastrar cartão: ${error.message}` };
    }
};



