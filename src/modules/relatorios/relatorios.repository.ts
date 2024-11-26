import { connection } from '../../infra/database/mysql-connection';
import { promises as fs } from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { ListarDespesaPorClienteControler, ListarReceitasPorClienteControler, ListarInvestimentosPorClienteControler } from './relatorios.service';
import { promises as fsPromises } from 'fs';
import ExcelJS from 'exceljs';
import { gerarCodigoAleatorio } from '../../utils/codigoRandometro';


const dataAtual = new Date();
const dia = dataAtual.getDate(); // Dia do mês
const mes = dataAtual.getMonth() + 1; // Mês (0-11, então adicionamos 1)
const ano = dataAtual.getFullYear(); // Ano completo
const dataCompleta = `${ano}-${mes}-${dia}`



export async function saveReportToDatabase(id_cliente: number, reportType: string, periodo_inicio: string, periodo_fim: string, reportContent: string): Promise<void> {
    await connection.query(
        `INSERT INTO relatorios (id_cliente, tipo, periodo_inicio, periodo_fim, data_geracao, relatorio) VALUES (?, ?, ?, ?, ?, ?)`,
        [id_cliente, reportType, periodo_inicio, periodo_fim, dataCompleta, reportContent]
    );
}

// Função para gerar o arquivo CSV e salvá-lo no diretório especificado
export async function generateCSVFile(csvContent: string, fileName: string): Promise<string> {
    const bucketDir = path.resolve(__dirname, '..' ,'bucket');
    const filePath = path.join(bucketDir, `${fileName}.csv`);

    // Certifique-se de que o diretório existe; se não, crie-o
    await fs.mkdir(bucketDir, { recursive: true });

    // Salva o conteúdo do CSV no arquivo
    await fs.writeFile(filePath, csvContent, 'utf8');

    console.log(`Arquivo CSV gerado e salvo em: ${filePath}`);
    return filePath;
}



export async function gerarRelatorioExcel(
    id_cliente: string,
    data_inicial: string,
    data_final: string
): Promise<{ fileName: string; filePath: string }> {
    const datStrIni: string = dayjs(data_inicial.replace(/["'\[\]\(\)]/g, '')).format('YYYY-MM-DD');
    const datStrFim: string = dayjs(data_final.replace(/["'\[\]\(\)]/g, '')).format('YYYY-MM-DD');

    // Obter dados
    const despesas = await ListarDespesaPorClienteControler(id_cliente, datStrIni, datStrFim);
    const receitas = await ListarReceitasPorClienteControler(id_cliente, datStrIni, datStrFim);
    const investimentos = await ListarInvestimentosPorClienteControler(id_cliente, datStrIni, datStrFim);

    const despesasOrdenadas = despesas.sort((a: any, b: any) => (a.categoria || "").localeCompare(b.categoria || ""));
    const receitasOrdenadas = receitas.sort((a: any, b: any) => (a.categoria || "").localeCompare(b.categoria || ""));
    const investimentosOrdenados = investimentos.sort((a: any, b: any) => (a.tipo || "").localeCompare(b.tipo || ""));

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Relatório Consolidado');
    let currentRow = 1;

    // Título
    sheet.mergeCells('A1:D1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `Relatório período ${dayjs(datStrIni).format('DD/MM/YYYY')} a ${dayjs(datStrFim).format('DD/MM/YYYY')}`;
    titleCell.font = { name: 'Arial', size: 20, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
    currentRow += 1;

    // Subtítulos
    const pastelColors = ['FFFBE4B4', 'FFF3B6C1', 'FFE6E6FA', 'FFE0FFFF'];
    const addSubtitle = (text: string, colorIndex: number) => {
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
    despesasOrdenadas.forEach((d: any) => {
        sheet.addRow([d.categoria, d.descricao, d.valor.replace('.', ','), dayjs(d.data).format('DD/MM/YYYY')]);
        currentRow += 1;
    });

    currentRow += 1;

    addSubtitle('Detalhes de Receitas', 2);
    sheet.addRow(['Categoria', 'Descrição', 'Valor', 'Data']).font = { bold: true };
    currentRow += 1;
    receitas.forEach((r: any) => {
        sheet.addRow([r.categoria, r.descricao, r.valor.replace('.', ','), dayjs(r.data).format('DD/MM/YYYY')]);
        currentRow += 1;
    });

    currentRow += 1;

    addSubtitle('Detalhes de Investimentos', 3);
    sheet.addRow(['Tipo', 'Descrição', 'Valor', 'Data']).font = { bold: true };
    currentRow += 1;
    investimentos.forEach((i: any) => {
        sheet.addRow([i.tipo, i.descricao, i.valor.replace('.', ','), dayjs(i.data).format('DD/MM/YYYY')]);
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
    const codigo = gerarCodigoAleatorio();
    const fileName = `relatorio_financeiro_${id_cliente}_${codigo}_${dayjs().format('YYYYMMDD')}.xlsx`;
    const filePath = path.join('./bucket', fileName);

    try {
        await fs.access('./bucket');
    } catch {
        await fs.mkdir('./bucket', { recursive: true });
    }

    await workbook.xlsx.writeFile(filePath);

    return { fileName, filePath };
}




