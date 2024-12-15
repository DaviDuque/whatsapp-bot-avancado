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
exports.cadastrarReceitaService = void 0;
// receitas.service.ts
const mysql_connection_1 = require("../../infra/database/mysql-connection");
const dayjs_1 = __importDefault(require("dayjs"));
// Função para cadastrar uma nova receita
const cadastrarReceitaService = (id_cliente, descricao, valor, data_receita, categoria) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newDate = (0, dayjs_1.default)(data_receita).format('YYYY-MM-DD HH:mm:ss');
        const query = 'INSERT INTO receitas (id_cliente, descricao, valor, data_receita, categoria) VALUES (?, ?, ?, ?, ?)';
        const values = [id_cliente, descricao.trimStart(), valor, newDate, categoria];
        yield mysql_connection_1.connection.execute(query, values);
    }
    catch (error) {
        console.error('Erro ao cadastrar receita:', error);
        throw error;
    }
});
exports.cadastrarReceitaService = cadastrarReceitaService;
