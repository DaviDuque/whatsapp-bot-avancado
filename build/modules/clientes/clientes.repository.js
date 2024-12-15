"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modificarStatusCliente = exports.atualizarStatusCliente = exports.buscarClientePorTelefone = exports.buscarClientes = exports.cadastrarCliente = exports.criarClientePorTelefone = exports.verificarClientePorTelefone = void 0;
//clientes.repository.ts
const mysql_connection_1 = require("../../infra/database/mysql-connection");
const trata_telefone_1 = require("../../utils/trata-telefone");
const states_1 = require("../../infra/states/states");
const verificarClientePorTelefone = (telefone) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield mysql_connection_1.connection.execute('SELECT * FROM clientes WHERE telefone = ?', [telefone]);
        if (rows.length > 0) {
            const From = (0, trata_telefone_1.reverterNumeroTelefone)(telefone);
            (0, states_1.verificarClienteEstado)(rows[0].id_cliente);
            (0, states_1.verificarClienteEstado)(From);
        }
        return rows.length > 0;
    }
    catch (error) {
        console.error('Erro ao verificar cliente por telefone:', error);
        throw new Error('Erro ao verificar cliente por telefone');
    }
});
exports.verificarClientePorTelefone = verificarClientePorTelefone;
const criarClientePorTelefone = (telefone) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield mysql_connection_1.connection.execute('SELECT * FROM clientes WHERE telefone = ?', [telefone]);
        if (rows.length > 0) {
            const From = (0, trata_telefone_1.reverterNumeroTelefone)(telefone);
            (0, states_1.verificarClienteEstado)(rows[0].id_cliente);
        }
        return rows[0].id_cliente;
    }
    catch (error) {
        console.error('Erro ao criar cliente por telefone:', error);
        throw new Error('Erro ao criar cliente por telefone');
    }
});
exports.criarClientePorTelefone = criarClientePorTelefone;
const cadastrarCliente = (cliente) => __awaiter(void 0, void 0, void 0, function* () {
    const { nome, email, telefone, cpf, id_endereco, codigo_indicacao, codigo_proprio, senha } = cliente;
    yield mysql_connection_1.connection.execute(`INSERT INTO clientes (nome, email, telefone, cpf, id_endereco, codigo_indicacao, codigo_proprio, senha) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [nome, email, telefone, cpf, id_endereco, codigo_indicacao, codigo_proprio, senha]);
});
exports.cadastrarCliente = cadastrarCliente;
const buscarClientes = () => __awaiter(void 0, void 0, void 0, function* () {
    const [response] = yield mysql_connection_1.connection.execute(`select * from clientes cl inner join enderecos e on cl.id_endereco = e.id_endereco left join cidades c on e.id_cidade = c.id_cidade`);
    return response;
});
exports.buscarClientes = buscarClientes;
const buscarClientePorTelefone = (telefone) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield mysql_connection_1.connection.execute('SELECT * FROM clientes WHERE telefone = ?', [telefone]);
    if (rows.length > 0) {
        const From = (0, trata_telefone_1.reverterNumeroTelefone)(telefone);
        const estadoCliente = (0, states_1.verificarClienteEstado)(rows.id_cliente);
    }
    return rows;
});
exports.buscarClientePorTelefone = buscarClientePorTelefone;
const atualizarStatusCliente = (id_cliente) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("id_cliente>>>>>", id_cliente);
        const result = yield mysql_connection_1.connection.query(`UPDATE clientes SET status = 3 WHERE id_cliente = ${id_cliente}`);
        console.log("rsp>>>>>", result);
        return { status: "sucesso" };
    }
    catch (error) {
        console.log("errro>>>>>", error);
        return { status: "errror" };
    }
});
exports.atualizarStatusCliente = atualizarStatusCliente;
const modificarStatusCliente = (idTransacaoGateway) => __awaiter(void 0, void 0, void 0, function* () {
    const operacoes = yield mysql_connection_1.connection.getConnection();
    try {
        yield operacoes.beginTransaction();
        const [transacao] = yield operacoes.query(`
          SELECT id_cliente
          FROM transacoes
          WHERE id_transacao_gateway = ?
          LIMIT 1
        `, [idTransacaoGateway]);
        if (transacao.length === 0) {
            throw new Error('Transação não encontrada.');
        }
        const idCliente = transacao[0].id_cliente;
        console.log("id do cliente", idCliente);
        const [updateResult] = yield operacoes.query(`UPDATE clientes SET status = 3 WHERE id_cliente = ?`, [idCliente]);
        if (updateResult.affectedRows === 0) {
            throw new Error('Falha ao atualizar o status do cliente.');
        }
        yield operacoes.commit();
        return true;
    }
    catch (error) {
        yield operacoes.rollback();
        console.error('Erro durante a transação:', error);
        return false;
    }
    finally {
        operacoes.release();
    }
});
exports.modificarStatusCliente = modificarStatusCliente;
