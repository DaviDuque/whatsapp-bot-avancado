import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { 
    ListarDespesaPorClienteControler, 
    ListarReceitasPorClienteControler, 
    ListarInvestimentosPorClienteControler 
} from './relatorios.service';
import { saveReportToDatabase } from './relatorios.repository';
import dayjs from 'dayjs';

export class RelatoriosTotal {
    RelatorioTotal = async (req: Request, res: Response) => {
        try {
            const { id_cliente, data_inicial, data_final } = req.body;

            if (!id_cliente || !data_inicial || !data_final) {
                return res.status(400).json({ message: "Parâmetros obrigatórios ausentes." });
            }

            // Busca de dados
            const despesas = await ListarDespesaPorClienteControler(id_cliente, data_inicial, data_final);
            const receitas = await ListarReceitasPorClienteControler(id_cliente, data_inicial, data_final);
            const investimentos = await ListarInvestimentosPorClienteControler(id_cliente, data_inicial, data_final);

            // Cálculos de resumo
            const totalDespesas = despesas.reduce((sum: number, item: { valor: number }) => sum + Number(item.valor || 0), 0);
            const totalReceitas = receitas.reduce((sum: number, item: { valor: number }) => sum + Number(item.valor || 0), 0);
            const totalInvestimentos = investimentos.reduce((sum: number, item: { valor: number }) => sum + Number(item.valor || 0), 0);

            const saldo = totalReceitas - totalDespesas;
            const percentualInvestido = saldo > 0 ? ((totalInvestimentos / saldo) * 100).toFixed(2) : "0.00";

            // Criação da planilha
            const workbook = XLSX.utils.book_new();

            // Adiciona resumo financeiro
            const resumo = [
                ["Resumo Financeiro"],
                ["Receitas", totalReceitas.toFixed(2)],
                ["Despesas", totalDespesas.toFixed(2)],
                ["Investimentos", totalInvestimentos.toFixed(2)],
                ["Saldo", saldo.toFixed(2)],
                ["Percentual Investido (%)", percentualInvestido],
            ];

            const resumoSheet = XLSX.utils.aoa_to_sheet(resumo);

            // Adiciona estilo ao título da aba Resumo
            resumoSheet["A1"].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4F81BD" } },
            };

            XLSX.utils.book_append_sheet(workbook, resumoSheet, "Resumo");

            // Adiciona despesas com estilo
            const despesasSheetData = [["Categoria", "Valor"]];
            despesas.forEach((despesa: any) => {
                despesasSheetData.push([despesa.categoria, Number(despesa.valor).toFixed(2)]);
            });

            const despesasSheet = XLSX.utils.aoa_to_sheet(despesasSheetData);

            // Estiliza a linha do cabeçalho
            despesasSheet["A1"].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "C0504D" } },
            };

            XLSX.utils.book_append_sheet(workbook, despesasSheet, "Despesas");

            // Adiciona receitas com estilo
            const receitasSheetData = [["Categoria", "Valor"]];
            receitas.forEach((receita: any) => {
                receitasSheetData.push([receita.categoria, Number(receita.valor).toFixed(2)]);
            });

            const receitasSheet = XLSX.utils.aoa_to_sheet(receitasSheetData);
            receitasSheet["A1"].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "9BBB59" } },
            };

            XLSX.utils.book_append_sheet(workbook, receitasSheet, "Receitas");

            // Adiciona investimentos com estilo
            const investimentosSheetData = [["Categoria", "Valor"]];
            investimentos.forEach((investimento: any) => {
                investimentosSheetData.push([investimento.categoria, Number(investimento.valor).toFixed(2)]);
            });

            const investimentosSheet = XLSX.utils.aoa_to_sheet(investimentosSheetData);
            investimentosSheet["A1"].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4F81BD" } },
            };

            XLSX.utils.book_append_sheet(workbook, investimentosSheet, "Investimentos");

            // Salva o arquivo XLSX
            const fileName = `relatorio_financeiro_1111${id_cliente}_${dayjs().format("YYYYMMDD")}.xlsx`;
            const filePath = path.join("./src/bucket", fileName);

            // Certifique-se de que o diretório existe
            if (!fs.existsSync("./src/bucket")) {
                fs.mkdirSync("./src/bucket", { recursive: true });
            }

            XLSX.writeFile(workbook, filePath);

            // Salva o relatório no banco
            await saveReportToDatabase(id_cliente, "Relatório Completo", data_inicial, data_final, filePath);

            return res.status(200).json({
                message: "Relatório gerado com sucesso.",
                fileName,
                filePath,
            });
        } catch (error) {
            console.error("Erro ao gerar relatório:", error);
            return res.status(500).json({ message: "Erro ao gerar relatório.", error });
        }
    };
}
