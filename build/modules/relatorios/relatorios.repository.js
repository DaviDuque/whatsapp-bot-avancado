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
exports.gerarRelatorioExcel = gerarRelatorioExcel;
const mysql_connection_1 = require("../../infra/database/mysql-connection");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const dayjs_1 = __importDefault(require("dayjs"));
const relatorios_service_1 = require("./relatorios.service");
const exceljs_1 = __importDefault(require("exceljs"));
const codigoRandometro_1 = require("../../utils/codigoRandometro");
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
function gerarRelatorioExcel(id_cliente, data_inicial, data_final) {
    return __awaiter(this, void 0, void 0, function* () {
        const datStrIni = (0, dayjs_1.default)(data_inicial.replace(/["'\[\]\(\)]/g, '')).format('YYYY-MM-DD');
        const datStrFim = (0, dayjs_1.default)(data_final.replace(/["'\[\]\(\)]/g, '')).format('YYYY-MM-DD');
        // Obter dados
        const despesas = yield (0, relatorios_service_1.ListarDespesaPorClienteControler)(id_cliente, datStrIni, datStrFim);
        const receitas = yield (0, relatorios_service_1.ListarReceitasPorClienteControler)(id_cliente, datStrIni, datStrFim);
        const investimentos = yield (0, relatorios_service_1.ListarInvestimentosPorClienteControler)(id_cliente, datStrIni, datStrFim);
        const despesasOrdenadas = despesas.sort((a, b) => (a.categoria || "").localeCompare(b.categoria || ""));
        const receitasOrdenadas = receitas.sort((a, b) => (a.categoria || "").localeCompare(b.categoria || ""));
        const investimentosOrdenados = investimentos.sort((a, b) => (a.tipo || "").localeCompare(b.tipo || ""));
        const workbook = new exceljs_1.default.Workbook();
        const sheet = workbook.addWorksheet('Relatório Consolidado');
        let currentRow = 1;
        // Título
        sheet.mergeCells('A1:D1');
        const titleCell = sheet.getCell('A1');
        titleCell.value = `Relatório período ${(0, dayjs_1.default)(datStrIni).format('DD/MM/YYYY')} a ${(0, dayjs_1.default)(datStrFim).format('DD/MM/YYYY')}`;
        titleCell.font = { name: 'Arial', size: 20, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
        currentRow += 1;
        // Subtítulos
        const pastelColors = ['FFFBE4B4', 'FFF3B6C1', 'FFE6E6FA', 'FFE0FFFF'];
        const addSubtitle = (text, colorIndex) => {
            const cell = sheet.getCell(`A${currentRow}`);
            cell.value = text;
            cell.font = { name: 'Arial', size: 14, bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: pastelColors[colorIndex % pastelColors.length] } };
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
            sheet.mergeCells(`A${currentRow}:D${currentRow}`);
            currentRow += 1; // Incrementa a linha após adicionar o subtítulo
        };
        addSubtitle('Resumo Financeiro', 0);
        currentRow += 1;
        // Dados de resumo
        sheet.addRow(['Tipo', 'Valor']).font = { bold: true };
        sheet.addRow(['Receitas', '1200,00']);
        sheet.addRow(['Despesas', '450,00']);
        sheet.addRow(['Investimentos', '1000,00']);
        sheet.addRow(['Saldo', '750,00']);
        currentRow += 7;
        addSubtitle('Detalhes de Despesas', 1);
        sheet.addRow(['Categoria', 'Descrição', 'Valor', 'Data']).font = { bold: true };
        currentRow += 1;
        despesasOrdenadas.forEach((d) => {
            sheet.addRow([d.categoria, d.descricao, d.valor.replace('.', ','), (0, dayjs_1.default)(d.data).format('DD/MM/YYYY')]);
            currentRow += 1;
        });
        currentRow += 1;
        addSubtitle('Detalhes de Receitas', 2);
        sheet.addRow(['Categoria', 'Descrição', 'Valor', 'Data']).font = { bold: true };
        currentRow += 1;
        receitas.forEach((r) => {
            sheet.addRow([r.categoria, r.descricao, r.valor.replace('.', ','), (0, dayjs_1.default)(r.data).format('DD/MM/YYYY')]);
            currentRow += 1;
        });
        currentRow += 1;
        addSubtitle('Detalhes de Investimentos', 3);
        sheet.addRow(['Tipo', 'Descrição', 'Valor', 'Data']).font = { bold: true };
        currentRow += 1;
        investimentos.forEach((i) => {
            sheet.addRow([i.tipo, i.descricao, i.valor.replace('.', ','), (0, dayjs_1.default)(i.data).format('DD/MM/YYYY')]);
            currentRow += 1;
        });
        // Ajustar largura de colunas
        sheet.columns = [
            { width: 35 },
            { width: 30 },
            { width: 30 },
            { width: 30 },
        ];
        // Exemplo de uso
        const codigo = (0, codigoRandometro_1.gerarCodigoAleatorio)();
        const fileName = `relatorio_financeiro_${id_cliente}_${codigo}_${(0, dayjs_1.default)().format('YYYYMMDD')}.xlsx`;
        const filePath = path_1.default.join('./bucket', fileName);
        try {
            yield fs_1.promises.access('./bucket');
        }
        catch (_a) {
            yield fs_1.promises.mkdir('./bucket', { recursive: true });
        }
        yield workbook.xlsx.writeFile(filePath);
        return { fileName, filePath };
    });
}
