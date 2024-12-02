import { connection } from '../../infra/database/mysql-connection';


export const cadastrarMeta = async (
    id_cliente: string, 
    descricao: string, 
    valor_objetivo: number, 
    valor_atual: number, 
    data_limite: string): Promise<{ sucesso: boolean; mensagem: string }> => {
    try {
        const query = 'INSERT INTO metas_financeiras (id_cliente, descricao, valor_objetivo, valor_atual, data_limite) VALUES (?, ?, ?, ?, ?)';
        const values = [
            id_cliente,
            descricao.trim(),
            valor_objetivo,
            valor_atual,
            data_limite.trim(),
        ];
        await connection.execute(query, values);
        return { sucesso: true, mensagem: 'Meta cadastrado com sucesso.' };
    } catch (error) {
        console.error('Erro ao cadastrar cartão:', error);
        return { sucesso: false, mensagem: `Erro ao cadastrar meta: ${error}` };
    }
};


export const buscarMetasPorCliente = async (
    id_cliente: string, 
   ): Promise<{ sucesso: boolean; mensagem: string, dados: any }> => {
    try {
        const query = 'select * from metas_financeiras where id_cliente = ?';
        const values = [
            id_cliente
        ];
         const [dados] = await connection.execute(query, values);
        return { sucesso: true, mensagem: 'sSssucesso.', dados:dados };
    } catch (error) {
        console.error('Erro ao encontrar metas:', error);
        return { sucesso: false, mensagem: `Erro ao encontrar meta: ${error}`, dados: "erro" };
    }
};







