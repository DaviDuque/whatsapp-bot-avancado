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
exports.cadastrarConta = exports.verificarContaPorCliente = void 0;
const mysql_connection_1 = require("../../infra/database/mysql-connection");
const verificarContaPorCliente = (cliente_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield mysql_connection_1.connection.query('SELECT * FROM contas WHERE cliente_id = ?', [cliente_id]);
        if (Array.isArray(rows) && rows.length > 0) {
            return true;
        }
        return false;
    }
    catch (error) {
        console.error('Erro ao verificar conta :', error);
        throw error;
    }
});
exports.verificarContaPorCliente = verificarContaPorCliente;
const cadastrarConta = (id_cliente, nome_conta, tipo, banco, limite, saldo) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = 'INSERT INTO contas (id_cliente, nome_conta, tipo, banco, limite, saldo) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [
            id_cliente,
            nome_conta.trim(),
            tipo.trim(),
            banco.trim(),
            limite || null,
            saldo || null
        ];
        yield mysql_connection_1.connection.execute(query, values);
        return { sucesso: true, mensagem: 'Conta cadastrado com sucesso.' };
    }
    catch (error) {
        console.error('Erro ao cadastrar conta:', error);
        return { sucesso: false, mensagem: `Erro ao cadastrar conta: ${error.message}` };
    }
});
exports.cadastrarConta = cadastrarConta;
