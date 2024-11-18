import { connection } from '../../infra/database/mysql-connection';
import dayjs from 'dayjs';



export const cadastrarMeta = async (id_cliente: string, descricao: string, valor_objetivo: number, valor_atual: number, data_limite: string) => {
    try {
        //const newDate: string = dayjs(data_despesa).format('YYYY-MM-DD HH:mm:ss');
        const query = 'INSERT INTO cartoes (id_cliente, descricao, tipo, banco, limite, saldo) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [
            id_cliente,
            descricao.trim(),
            valor_objetivo,
            valor_atual,
            data_limite.trim(),
            
        ];
        await connection.execute(query, values);
    } catch (error) {
        console.error('Erro ao cadastrar cartão:', error);
        throw error;
    }
};



`metas_financeiras`.`descricao`,
`metas_financeiras`.`valor_objetivo`,
`metas_financeiras`.`valor_atual`,
`metas_financeiras`.`data_limite`,







