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
exports.ListarReceitasPorCliente = exports.buscarReceitasPorTelefone = void 0;
// receitas.repository.ts
const mysql_connection_1 = require("../../infra/database/mysql-connection");
const buscarReceitasPorTelefone = (telefone) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 'SELECT * FROM receitas WHERE telefone = ?';
    const [rows] = yield mysql_connection_1.connection.execute(query, [telefone]);
    return rows;
});
exports.buscarReceitasPorTelefone = buscarReceitasPorTelefone;
const ListarReceitasPorCliente = (id_cliente, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield mysql_connection_1.connection.query(`SELECT descricao, valor, data_receita AS data, categoria FROM receitas
         WHERE id_cliente = ? AND data_receita BETWEEN ? AND ?`, [id_cliente, startDate, endDate]);
        console.log("rows", rows);
        return rows;
    }
    catch (error) {
        console.error('Erro ao verificar despesa:', error);
        throw error;
    }
});
exports.ListarReceitasPorCliente = ListarReceitasPorCliente;
