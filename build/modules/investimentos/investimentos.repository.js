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
exports.ListarInvestimentosPorCliente = exports.buscarInvestimentosPorTelefone = void 0;
// receitas.repository.ts
const mysql_connection_1 = require("../../infra/database/mysql-connection");
const buscarInvestimentosPorTelefone = (telefone) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'SELECT * FROM receitas WHERE telefone = ?';
    const [rows] = yield mysql_connection_1.connection.execute(query, [telefone]);
    return rows;
});
exports.buscarInvestimentosPorTelefone = buscarInvestimentosPorTelefone;
const ListarInvestimentosPorCliente = (id_cliente, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield mysql_connection_1.connection.query(`SELECT 'investimentos' AS Investimentos, id_cliente, descricao, valor, data_investimento AS data, tipo 
         FROM investimentos 
         WHERE id_cliente = ? and data_investimento BETWEEN ? AND ?`, [id_cliente, startDate, endDate]);
        console.log("rows", rows);
        return rows;
    }
    catch (error) {
        console.error('Erro ao verificar despesa:', error);
        throw error;
    }
});
exports.ListarInvestimentosPorCliente = ListarInvestimentosPorCliente;
