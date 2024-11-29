//clientes.repository.ts
import { connection } from '../../infra/database/mysql-connection';
import { RowDataPacket } from 'mysql2';
import { reverterNumeroTelefone } from '../../utils/trata-telefone';
import {  verificarClienteEstado } from '../../infra/states/states'

export interface Cliente {
    id_cliente?: any;
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

    if(rows.length > 0){
        const From = reverterNumeroTelefone(telefone);
        const cliente = verificarClienteEstado(rows[0].id_cliente);
        const teste = verificarClienteEstado(From);
    }
    return rows.length > 0;
};


export const criarClientePorTelefone = async (telefone: string): Promise<string> => {
    const [rows] = await connection.execute<RowDataPacket[]>('SELECT * FROM clientes WHERE telefone = ?', [telefone]);

    if(rows.length > 0){
        const From = reverterNumeroTelefone(telefone);
        const teste = verificarClienteEstado(rows[0].id_cliente);
    }
    return rows[0].id_cliente;
};

export const cadastrarCliente = async (cliente: Cliente): Promise<void> => {
    const { nome, email, telefone, cpf, id_endereco, codigo_indicacao, codigo_proprio, senha } = cliente;
    
    await connection.execute(
        `INSERT INTO clientes (nome, email, telefone, cpf, id_endereco, codigo_indicacao, codigo_proprio, senha) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nome, email, telefone, cpf, id_endereco, codigo_indicacao, codigo_proprio, senha]
    );
};

export const buscarClientes = async (): Promise<any> => {
    const [response] = await connection.execute(`select * from clientes cl inner join enderecos e on cl.id_endereco = e.id_endereco left join cidades c on e.id_cidade = c.id_cidade`);
    return response;
};


export const buscarClientePorTelefone  = async (telefone: string): Promise<[]> => {
    const [rows]: any = await connection.execute<[]>('SELECT * FROM clientes WHERE telefone = ?', [telefone]);

    if(rows.length > 0){
        const From = reverterNumeroTelefone(telefone);
        const estadoCliente = verificarClienteEstado(rows.id_cliente);
    }
    return rows;
};







