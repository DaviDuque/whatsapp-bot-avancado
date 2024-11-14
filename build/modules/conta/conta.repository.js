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
exports.limparEstadoConta = exports.atualizarEstadoConta = exports.verificarEstadoConta = exports.cadastrarConta = exports.verificarContaPorCliente = void 0;
const mysql_connection_1 = require("../../infra/database/mysql-connection");
const verificarContaPorCliente = (cliente_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield mysql_connection_1.connection.query('SELECT * FROM contas WHERE cliente_id = ?', [cliente_id]);
        // Verificando se a consulta retornou algum resultado
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
        //const newDate: string = dayjs(data_despesa).format('YYYY-MM-DD HH:mm:ss');
        const query = 'INSERT INTO contas (id_cliente, nome_conta, tipo, banco, limite, saldo) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [
            id_cliente,
            nome_conta.trim(),
            tipo.trim(),
            banco.trim(),
            limite,
            saldo
        ];
        yield mysql_connection_1.connection.execute(query, values);
    }
    catch (error) {
        console.error('Erro ao cadastrar conta:', error);
        throw error;
    }
});
exports.cadastrarConta = cadastrarConta;
const verificarEstadoConta = (from) => __awaiter(void 0, void 0, void 0, function* () {
    // Implementar lógica para verificar o estado atual do cadastro
});
exports.verificarEstadoConta = verificarEstadoConta;
const atualizarEstadoConta = (from, estado) => __awaiter(void 0, void 0, void 0, function* () {
    // Implementar lógica para atualizar o estado do cadastro
});
exports.atualizarEstadoConta = atualizarEstadoConta;
const limparEstadoConta = (from) => __awaiter(void 0, void 0, void 0, function* () {
    // Implementar lógica para limpar o estado do cadastro
});
exports.limparEstadoConta = limparEstadoConta;
