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
exports.saveReportToDatabase = saveReportToDatabase;
exports.generateCSVFile = generateCSVFile;
const mysql_connection_1 = require("../../infra/database/mysql-connection");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const dataAtual = new Date();
const dia = dataAtual.getDate(); // Dia do mês
const mes = dataAtual.getMonth() + 1; // Mês (0-11, então adicionamos 1)
const ano = dataAtual.getFullYear(); // Ano completo
const dataCompleta = `${ano}-${mes}-${dia}`;
function saveReportToDatabase(id_cliente, reportType, periodo_inicio, periodo_fim, reportContent) {
    return __awaiter(this, void 0, void 0, function* () {
        yield mysql_connection_1.connection.query(`INSERT INTO relatorios (id_cliente, tipo, periodo_inicio, periodo_fim, data_geracao, relatorio) VALUES (?, ?, ?, ?, ?, ?)`, [id_cliente, reportType, periodo_inicio, periodo_fim, dataCompleta, reportContent]);
    });
}
// Função para gerar o arquivo CSV e salvá-lo no diretório especificado
function generateCSVFile(csvContent, fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const bucketDir = path_1.default.resolve(__dirname, '..', 'bucket');
        const filePath = path_1.default.join(bucketDir, `${fileName}.csv`);
        // Certifique-se de que o diretório existe; se não, crie-o
        yield fs_1.promises.mkdir(bucketDir, { recursive: true });
        // Salva o conteúdo do CSV no arquivo
        yield fs_1.promises.writeFile(filePath, csvContent, 'utf8');
        console.log(`Arquivo CSV gerado e salvo em: ${filePath}`);
        return filePath;
    });
}
