import { connection } from '../src/infra/database/mysql-connection';
import { RowDataPacket } from 'mysql2';

export const verificarClientePorTelefone = async (telefone: string): Promise<boolean> => {
    const [rows] = await connection.execute<RowDataPacket[]>('SELECT * FROM clientes WHERE telefone = ?', [telefone]);
    console.log("linhas de clientes------>", rows);
    return rows.length > 0;
};
