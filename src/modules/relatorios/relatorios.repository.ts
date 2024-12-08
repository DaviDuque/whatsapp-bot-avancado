import { connection } from '../../infra/database/mysql-connection';
import { promises as fs } from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { ListarDespesaPorClienteControler, ListarReceitasPorClienteControler, ListarInvestimentosPorClienteControler } from './relatorios.service';
import { promises as fsPromises } from 'fs';
import ExcelJS from 'exceljs';
import { gerarCodigoAleatorio } from '../../utils/codigoRandometro';
import { buscarMetasPorCliente } from '../metas/metas.repository';
import { buscarCartaoPorCliente } from '../cartao/cartao.repository';


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
    const metas: any = await buscarMetasPorCliente(id_cliente);
    const cartoes: any = await buscarCartaoPorCliente(id_cliente);
    console.log(">>>>>>metas", metas.dados);
    console.log(">>>>>>receitas", receitas);
    console.log(">>>>>>despesas", despesas);
    console.log(">>>>>>investimentos", investimentos);
    console.log(">>>>>>cartoes", cartoes.dados);

    const despesasOrdenadas = despesas.sort((a: any, b: any) => (a.categoria || "").localeCompare(b.categoria || ""));
    const receitasOrdenadas = receitas.sort((a: any, b: any) => (a.categoria || "").localeCompare(b.categoria || ""));
    const investimentosOrdenados = investimentos.sort((a: any, b: any) => (a.tipo || "").localeCompare(b.tipo || ""));

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Relatório Consolidado');
    let currentRow = 1;

    // Título
    sheet.mergeCells('A1:E1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `Relatório período ${dayjs(datStrIni).format('DD/MM/YYYY')} a ${dayjs(datStrFim).format('DD/MM/YYYY')}`;
    titleCell.font = { name: 'Arial', size: 20, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
    currentRow += 1;

    // Subtítulos
    const pastelColors = ['FFFBE4B4', 'FFF3B6C1', 'FFE6E6FA', 'FFE0FFFF','FFFBE4B4'];
    const addSubtitle = (text: string, colorIndex: number) => {
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


    const totalDespesas = despesas.reduce((sum: number, item: { valor: number }) => sum + Number(item.valor || 0), 0);
    const totalReceitas = receitas.reduce((sum: number, item: { valor: number }) => sum + Number(item.valor || 0), 0);
    const totalInvestimentos = investimentos.reduce((sum: number, item: { valor: number }) => sum + Number(item.valor || 0), 0);

    const saldo = totalReceitas - totalDespesas;
    //const StringSaldo: string = saldo.toString();
    const percentualInvestido = saldo > 0 ? ((totalInvestimentos / saldo) * 100).toFixed(2) : "0.00";
    //const StringPercentualInvestido: string = percentualInvestido.toString();
    
    console.log(".....totalReceitas", `R$${totalReceitas}`);
    console.log(".....", );
    console.log(".....", );
    console.log(".....", );
    console.log(".....", );
    console.log(".....StringPercentualInvestido", `R$${percentualInvestido}`);

    // Dados de resumo
    sheet.addRow(['Tipo', 'Valor']).font = { bold: true };
    sheet.addRow(['Receitas',`R$${totalReceitas}`]);
    sheet.addRow(['Despesas', `R$${totalDespesas}`]);
    sheet.addRow(['Investimentos', `R$${totalInvestimentos}`]);
    sheet.addRow(['Saldo', `R$${saldo}`]);
    sheet.addRow(['Percentual investido',  `${percentualInvestido}%`]);
    currentRow += 8;

    console.log(".....totalReceitas", `R$${totalReceitas}`);
    console.log(".....", );
    console.log(".....", );
    console.log(".....", );
    console.log(".....", );
    console.log(".....StringPercentualInvestido", ` ${percentualInvestido}%`);

    addSubtitle('Detalhes de Despesas', 1);
    sheet.addRow(['Categoria', 'Descrição', 'Valor', 'Data']).font = { bold: true };
    currentRow += 1;
    despesasOrdenadas.forEach((d: any) => {
        sheet.addRow([d.categoria, d.descricao, `R$${d.valor.replace('.', ',')}`, dayjs(d.data).format('DD/MM/YYYY')]);
        currentRow += 1;
    });

    currentRow += 1;

    addSubtitle('Detalhes de Receitas', 2);
    sheet.addRow(['Categoria', 'Descrição', 'Valor', 'Data']).font = { bold: true };
    currentRow += 1;
    receitasOrdenadas.forEach((r: any) => {
        sheet.addRow([r.categoria, r.descricao, `R$${r.valor.replace('.', ',')}`, dayjs(r.data).format('DD/MM/YYYY')]);
        currentRow += 1;
    });

    currentRow += 1;

    addSubtitle('Detalhes de Investimentos', 3);
    sheet.addRow(['Tipo', 'Descrição', 'Valor', 'Data']).font = { bold: true };
    currentRow += 1;
    investimentosOrdenados.forEach((i: any) => {
        sheet.addRow([i.tipo, i.descricao, `R$${i.valor.replace('.', ',')}`, dayjs(i.data).format('DD/MM/YYYY')]);
        currentRow += 1;
    });



    currentRow += 1;

    addSubtitle('Minhas Metas', 4);
    sheet.addRow(['Descrição', 'Valor Objetivo', 'Valor do Momento', 'Data Limite']).font = { bold: true };
    currentRow += 1;
    metas.dados.forEach((i: any) => {
        sheet.addRow([
            i.descricao, 
            `R$${i.valor_objetivo.replace('.', ',')}`,
            `R$${i.valor_atual.replace('.', ',')}`, 
            dayjs(i.data_limite).format('DD/MM/YYYY')
        ]
        );
        currentRow += 1;
    });



    currentRow += 1;

    addSubtitle('Meus cartões', 4);
    sheet.addRow(['Cartão', 'Tipo', 'Banco', 'Limite']).font = { bold: true };
    currentRow += 1;
    cartoes.dados.forEach((i: any) => {
        sheet.addRow([
            i.nome_cartao,
            i.tipo,
            i.banco,
            `R$${i.limite_total.replace('.', ',')}`
        ]
        );
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




