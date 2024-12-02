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
exports.buscarCartaoPorCliente = exports.cadastrarCartao = exports.verificarCartaoPorCliente = void 0;
const mysql_connection_1 = require("../../infra/database/mysql-connection");
const verificarCartaoPorCliente = (cliente_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield mysql_connection_1.connection.query('SELECT * FROM cartoes WHERE cliente_id = ?', [cliente_id]);
        // Verificando se a consulta retornou algum resultado
        if (Array.isArray(rows) && rows.length > 0) {
            return true;
        }
        return false;
    }
    catch (error) {
        console.error('Erro ao verificar cartao:', error);
        throw error;
    }
});
exports.verificarCartaoPorCliente = verificarCartaoPorCliente;
const cadastrarCartao = (id_cliente, nome_cartao, tipo, banco, limite_total, limite_disponivel) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = 'INSERT INTO cartoes (id_cliente, nome_cartao, tipo, banco, limite_total, limite_disponivel) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [
            id_cliente,
            nome_cartao.trim(),
            tipo.trim(),
            banco.trim(),
            limite_total || null,
            limite_disponivel || null
        ];
        yield mysql_connection_1.connection.execute(query, values);
        return { sucesso: true, mensagem: 'Cartão cadastrado com sucesso.' };
    }
    catch (error) {
        console.error('Erro ao cadastrar cartão:', error);
        return { sucesso: false, mensagem: `Erro ao cadastrar cartão: ${error.message}` };
    }
});
exports.cadastrarCartao = cadastrarCartao;
const buscarCartaoPorCliente = (id_cliente) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = 'SELECT * FROM cartoes WHERE id_cliente = ?';
        const values = [
            id_cliente
        ];
        const [dados] = yield mysql_connection_1.connection.execute(query, values);
        return { sucesso: true, mensagem: 'Sucesso.', dados: dados };
    }
    catch (error) {
        console.error('Erro ao encontrar cartões:', error);
        return { sucesso: false, mensagem: `Erro ao encontrar cartões: ${error}`, dados: "erro" };
    }
});
exports.buscarCartaoPorCliente = buscarCartaoPorCliente;
