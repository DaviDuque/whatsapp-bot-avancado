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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cadastrarDespesa = exports.ListarDespesaPorCliente = exports.verificarDespesaPorCliente = void 0;
const mysql_connection_1 = require("../../infra/database/mysql-connection");
const dayjs_1 = __importDefault(require("dayjs"));
const verificarDespesaPorCliente = (id_cliente) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield mysql_connection_1.connection.query('SELECT * FROM despesas WHERE id_cliente = ?', [id_cliente]);
        if (Array.isArray(rows) && rows.length > 0) {
            return true;
        }
        return false;
    }
    catch (error) {
        console.error('Erro ao verificar despesa:', error);
        throw error;
    }
});
exports.verificarDespesaPorCliente = verificarDespesaPorCliente;
const ListarDespesaPorCliente = (id_cliente, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("listar despesas", id_cliente, startDate, endDate);
    try {
        const [rows] = yield mysql_connection_1.connection.query(`SELECT 'despesas' AS despesas, id_cliente, descricao, valor, data_despesa AS data, categoria 
            FROM despesas 
            WHERE id_cliente = ? and data_despesa BETWEEN ? AND ?`, [id_cliente, startDate, endDate]);
        console.log("rows", rows);
        return rows;
    }
    catch (error) {
        console.error('Erro ao verificar despesa:', error);
        throw error;
    }
});
exports.ListarDespesaPorCliente = ListarDespesaPorCliente;
const cadastrarDespesa = (id_cliente, descricao, valor, data_despesa, categoria, metodo_pagamento) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newDate = (0, dayjs_1.default)(data_despesa).format('YYYY-MM-DD HH:mm:ss');
        const query = 'INSERT INTO despesas (id_cliente, descricao, valor, data_despesa, categoria, metodo_pagamento) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [
            id_cliente,
            descricao.trim(),
            valor,
            newDate,
            categoria ? categoria.trim() : null,
            metodo_pagamento ? metodo_pagamento.trim() : 'n/a'
        ];
        yield mysql_connection_1.connection.execute(query, values);
    }
    catch (error) {
        console.error('Erro ao cadastrar receita:', error);
        throw error;
    }
});
exports.cadastrarDespesa = cadastrarDespesa;
