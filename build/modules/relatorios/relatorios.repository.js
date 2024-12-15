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
const metas_repository_1 = require("../metas/metas.repository");
const cartao_repository_1 = require("../cartao/cartao.repository");
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
        const metas = yield (0, metas_repository_1.buscarMetasPorCliente)(id_cliente);
        const cartoes = yield (0, cartao_repository_1.buscarCartaoPorCliente)(id_cliente);
        console.log(">>>>>>metas", metas.dados);
        console.log(">>>>>>receitas", receitas);
        console.log(">>>>>>despesas", despesas);
        console.log(">>>>>>investimentos", investimentos);
        console.log(">>>>>>cartoes", cartoes.dados);
        const despesasOrdenadas = despesas.sort((a, b) => (a.categoria || "").localeCompare(b.categoria || ""));
        const receitasOrdenadas = receitas.sort((a, b) => (a.categoria || "").localeCompare(b.categoria || ""));
        const investimentosOrdenados = investimentos.sort((a, b) => (a.tipo || "").localeCompare(b.tipo || ""));
        const workbook = new exceljs_1.default.Workbook();
        const sheet = workbook.addWorksheet('Relatório Consolidado');
        let currentRow = 1;
        // Título
        sheet.mergeCells('A1:E1');
        const titleCell = sheet.getCell('A1');
        titleCell.value = `Relatório período ${(0, dayjs_1.default)(datStrIni).format('DD/MM/YYYY')} a ${(0, dayjs_1.default)(datStrFim).format('DD/MM/YYYY')}`;
        titleCell.font = { name: 'Arial', size: 20, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
        currentRow += 1;
        // Subtítulos
        const pastelColors = ['FFFBE4B4', 'FFF3B6C1', 'FFE6E6FA', 'FFE0FFFF', 'FFFBE4B4'];
        const addSubtitle = (text, colorIndex) => {
            const cell = sheet.getCell(`A${currentRow}`);
            cell.value = text;
            cell.font = { name: 'Arial', size: 14, bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: pastelColors[colorIndex % pastelColors.length] } };
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
            sheet.mergeCells(`A${currentRow}:E${currentRow}`);
            currentRow += 1; // Incrementa a linha após adicionar o subtítulo
        };
        addSubtitle('Resumo Financeiro', 0);
        currentRow += 1;
        const totalDespesas = despesas.reduce((sum, item) => sum + Number(item.valor || 0), 0);
        const totalReceitas = receitas.reduce((sum, item) => sum + Number(item.valor || 0), 0);
        const totalInvestimentos = investimentos.reduce((sum, item) => sum + Number(item.valor || 0), 0);
        const saldo = totalReceitas - totalDespesas;
        const totalDespesasFormatado = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(totalDespesas);
        const totalReceitasFormatado = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(totalReceitas);
        const totalInvestimentosFormatado = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(totalInvestimentos);
        const saldoFormatado = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(saldo);
        const percentualInvestido = saldo > 0 ? ((totalInvestimentos / saldo) * 100).toFixed(2) : "0.00";
        const percentualInvestidoFormatado = percentualInvestido.replace(/\. /g, " ,");
        console.log(".....totalReceitas", `R$${totalReceitas}`);
        console.log(".....");
        console.log(".....");
        console.log(".....");
        console.log(".....");
        console.log(".....StringPercentualInvestido", `R$${percentualInvestido}`);
        // Dados de resumo
        sheet.addRow(['Tipo', 'Valor']).font = { bold: true };
        sheet.addRow(['Receitas', totalReceitasFormatado]).font = { bold: true };
        sheet.addRow(['Despesas', totalDespesasFormatado]).font = { bold: true };
        sheet.addRow(['Investimentos', totalInvestimentosFormatado]).font = { bold: true };
        sheet.addRow(['Saldo', saldoFormatado]).font = { bold: true };
        sheet.addRow(['Percentual investido', `${percentualInvestido}%`]).font = { bold: true };
        currentRow += 8;
        console.log(".....totalReceitas", `R$${totalReceitas}`);
        console.log(".....");
        console.log(".....");
        console.log(".....");
        console.log(".....");
        console.log(".....StringPercentualInvestido", ` ${percentualInvestido.replace('.', ',')}%`);
        addSubtitle('Detalhes de Despesas', 1);
        sheet.addRow(['Categoria', 'Descrição', 'Valor', 'Data']).font = { bold: true };
        currentRow += 1;
        despesasOrdenadas.forEach((d) => {
            sheet.addRow([d.categoria, d.descricao, `R$${d.valor.replace('.', ',')}`, (0, dayjs_1.default)(d.data).format('DD/MM/YYYY')]);
            currentRow += 1;
        });
        currentRow += 1;
        addSubtitle('Detalhes de Receitas', 2);
        sheet.addRow(['Categoria', 'Descrição', 'Valor', 'Data']).font = { bold: true };
        currentRow += 1;
        receitasOrdenadas.forEach((r) => {
            sheet.addRow([r.categoria, r.descricao, `R$${r.valor.replace('.', ',')}`, (0, dayjs_1.default)(r.data).format('DD/MM/YYYY')]);
            currentRow += 1;
        });
        currentRow += 1;
        addSubtitle('Detalhes de Investimentos', 3);
        sheet.addRow(['Tipo', 'Descrição', 'Valor', 'Data']).font = { bold: true };
        currentRow += 1;
        investimentosOrdenados.forEach((i) => {
            sheet.addRow([i.tipo, i.descricao, `R$${i.valor.replace('.', ',')}`, (0, dayjs_1.default)(i.data).format('DD/MM/YYYY')]);
            currentRow += 1;
        });
        currentRow += 1;
        addSubtitle('Minhas Metas', 4);
        sheet.addRow(['Descrição', 'Valor Objetivo', 'Valor do Momento', 'Data Limite']).font = { bold: true };
        currentRow += 1;
        metas.dados.forEach((i) => {
            sheet.addRow([
                i.descricao,
                `R$${i.valor_objetivo.replace('.', ',')}`,
                `R$${i.valor_atual.replace('.', ',')}`,
                (0, dayjs_1.default)(i.data_limite).format('DD/MM/YYYY')
            ]);
            currentRow += 1;
        });
        currentRow += 1;
        addSubtitle('Meus cartões', 4);
        sheet.addRow(['Cartão', 'Tipo', 'Banco', 'Limite']).font = { bold: true };
        currentRow += 1;
        cartoes.dados.forEach((i) => {
            sheet.addRow([
                i.nome_cartao,
                i.tipo,
                i.banco,
                `R$${i.limite_total.replace('.', ',')}`
            ]);
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
