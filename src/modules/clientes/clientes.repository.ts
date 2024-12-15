//clientes.repository.ts
import { connection } from '../../infra/database/mysql-connection';
import { RowDataPacket } from 'mysql2';
import { reverterNumeroTelefone } from '../../utils/trata-telefone';
import { verificarClienteEstado } from '../../infra/states/states'
import { ifError } from 'assert';

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
  try {
      const [rows] = await connection.execute<RowDataPacket[]>('SELECT * FROM clientes WHERE telefone = ?', [telefone]);

      if (rows.length > 0) {
          const From = reverterNumeroTelefone(telefone);
          verificarClienteEstado(rows[0].id_cliente);
          verificarClienteEstado(From);
      }
      return rows.length > 0;
  } catch (error) {
      console.error('Erro ao verificar cliente por telefone:', error);
      throw new Error('Erro ao verificar cliente por telefone');
  }
};


export const criarClientePorTelefone = async (telefone: string): Promise<string> => {
  try {
      const [rows] = await connection.execute<RowDataPacket[]>('SELECT * FROM clientes WHERE telefone = ?', [telefone]);

      if (rows.length > 0) {
          const From = reverterNumeroTelefone(telefone);
          verificarClienteEstado(rows[0].id_cliente);
      }
      return rows[0].id_cliente;
  } catch (error) {
      console.error('Erro ao criar cliente por telefone:', error);
      throw new Error('Erro ao criar cliente por telefone');
  }
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


export const buscarClientePorTelefone = async (telefone: string): Promise<[]> => {
    const [rows]: any = await connection.execute<[]>('SELECT * FROM clientes WHERE telefone = ?', [telefone]);

    if (rows.length > 0) {
        const From = reverterNumeroTelefone(telefone);
        const estadoCliente = verificarClienteEstado(rows.id_cliente);
    }
    return rows;
};

export const atualizarStatusCliente = async (id_cliente: number) => {
    try {
        console.log("id_cliente>>>>>", id_cliente);
        const result = await connection.query(
            `UPDATE clientes SET status = 3 WHERE id_cliente = ${id_cliente}`
        );
        console.log("rsp>>>>>", result);
        return { status: "sucesso" };
    } catch (error) {
        console.log("errro>>>>>", error);
        return { status: "errror" };
    }
};


export const modificarStatusCliente = async (idTransacaoGateway: string) => {
    const operacoes = await connection.getConnection(); 
    try {
      await operacoes.beginTransaction();
  
      const [transacao]: any = await operacoes.query(
        `
          SELECT id_cliente
          FROM transacoes
          WHERE id_transacao_gateway = ?
          LIMIT 1
        `,
        [idTransacaoGateway]
      );
  
      if (transacao.length === 0) {
        throw new Error('Transação não encontrada.');
      }
  
      const idCliente = transacao[0].id_cliente;
      console.log("id do cliente", idCliente);
  
      const [updateResult]: any = await operacoes.query(
        `UPDATE clientes SET status = 3 WHERE id_cliente = ?`,[idCliente]
      );
  
      if (updateResult.affectedRows === 0) {
        throw new Error('Falha ao atualizar o status do cliente.');
      }
  
      await operacoes.commit();
      return true;
    } catch (error) {

      await operacoes.rollback();
      console.error('Erro durante a transação:', error);
      return false;
    } finally {

      operacoes.release();
    }

  };









