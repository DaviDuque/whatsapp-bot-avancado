//clientes.repository.ts
import { connection } from '../../infra/database/mysql-connection';
import { RowDataPacket } from 'mysql2';

export interface Cliente {
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
    id_endereco: number;
    codigo_indicacao?: string;
    codigo_proprio: string;
    senha?: string;
}

export const verificarClientePorTelefone = async (telefone: string): Promise<boolean> => {
    const [rows] = await connection.execute<RowDataPacket[]>('SELECT * FROM clientes WHERE telefone = ?', [telefone]);
    return rows.length > 0;
};

export const cadastrarCliente = async (cliente: Cliente): Promise<void> => {
    const { nome, email, telefone, cpf, id_endereco, codigo_indicacao, codigo_proprio, senha } = cliente;
    
    await connection.execute(
        `INSERT INTO clientes (nome, email, telefone, cpf, id_endereco, codigo_indicacao, codigo_proprio, senha) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nome, email, telefone, cpf, id_endereco, codigo_indicacao, codigo_proprio, senha]
    );
};


const estadosClientes: { [telefone: string]: string } = {}; // Armazenar o estado temporário

export const verificarEstadoCliente = (telefone: string): string | undefined => {
    return estadosClientes[telefone];
};

export const atualizarEstadoCliente = (telefone: string, estado: string): void => {
    estadosClientes[telefone] = estado;
};

export const limparEstadoCliente = (telefone: string): void => {
    delete estadosClientes[telefone];
};








