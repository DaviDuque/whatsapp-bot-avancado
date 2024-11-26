import { connection } from '../../infra/database/mysql-connection';
import dayjs from 'dayjs';


export const verificarDespesaPorCliente = async (id_cliente: number) => {
    try {
        const [rows]: any = await connection.query('SELECT * FROM despesas WHERE id_cliente = ?', [id_cliente]);
        if (Array.isArray(rows) && rows.length > 0) {
            return true;
        }

        return false;
    } catch (error) {
        console.error('Erro ao verificar despesa:', error);
        throw error;
    }
};

export const ListarDespesaPorCliente = async (id_cliente: string, startDate: string, endDate: string) => {
    console.log("listar despesas", id_cliente, startDate, endDate);
    try {
        const [rows]: any = await connection.query( `SELECT 'despesas' AS despesas, id_cliente, descricao, valor, data_despesa AS data, categoria 
            FROM despesas 
            WHERE id_cliente = ? and data_despesa BETWEEN ? AND ?`, 
           [id_cliente, startDate, endDate]
       );
       console.log("rows", rows);
            return  rows;
    }catch (error) {
        console.error('Erro ao verificar despesa:', error);
        throw error;
    }

}


   

export const cadastrarDespesa = async (id_cliente: string, descricao: string, valor: number, data_despesa: string,  categoria?: string, metodo_pagamento?: string) => {
    try {
        const newDate: string = dayjs(data_despesa).format('YYYY-MM-DD HH:mm:ss');
        const query = 'INSERT INTO despesas (id_cliente, descricao, valor, data_despesa, categoria, metodo_pagamento) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [
            id_cliente,
            descricao.trim(),
            valor,
            newDate,
            categoria ? categoria.trim() : null,
            metodo_pagamento ?metodo_pagamento.trim() : 'n/a'
        ];
        await connection.execute(query, values);
    } catch (error) {
        console.error('Erro ao cadastrar receita:', error);
        throw error;
    }
};



