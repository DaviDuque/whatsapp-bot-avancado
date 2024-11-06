import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { ListarDespesaPorClienteControler } from './relatorios.service';
import { ListarReceitasPorClienteControler } from './relatorios.service';
import { ListarInvestimentosPorClienteControler } from './relatorios.service';
import { saveReportToDatabase, generateCSVFile } from './relatorios.repository';


import dayjs from 'dayjs';


export class Relatorios {
    RelatorioSimples = async (req: Request, res: Response) => {


       try {
            const { id_cliente, data_inicial, data_final } = req.body;
            const resultadoDespesas: any[] = await ListarDespesaPorClienteControler(id_cliente, data_inicial, data_final);
            const resultadoReceitas: any[] = await ListarReceitasPorClienteControler(id_cliente, data_inicial, data_final);
            const resultadoInvestimentos: any[] = await ListarInvestimentosPorClienteControler(id_cliente, data_inicial, data_final);
            const dataRelatorio: any = { resultadoReceitas, resultadoDespesas, resultadoInvestimentos}

            const csvContent = this.convertToCSV(resultadoDespesas, resultadoReceitas, resultadoInvestimentos);
          
            // Gera e salva o arquivo CSV no diretório ../../bucket
            const fileName = `relatorio_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}`;
            const filePath = await generateCSVFile(csvContent, fileName);
            console.log("resultado file >>>," ,filePath);

            await saveReportToDatabase(id_cliente, "Relatorio", data_inicial, data_final, csvContent);

            console.log("resultado>>>," ,csvContent);

            res.status(200).json(csvContent);
        } catch (error) {
            res.status(400).json({ message: error });
        }


        
    };




    convertToCSV = (despesas: any[], receitas: any[], investimentos: any[]): string => {
        const header = "Descrição,Valor,Data,Categoria,Tipo\n";
        let csvContent = header;
    
        const allData = [
            ...despesas.map(d => ({ ...d, tipo: 'Despesa' })),
            ...receitas.map(r => ({ ...r, tipo: 'Receita' })),
            ...investimentos.map(i => ({ ...i, tipo: 'Investimento' }))
        ];
    
        let total = 0;
    
        allData.forEach((item) => {
            csvContent += `${item.descricao},${item.valor},${item.data},${item.categoria},${item.tipo}\n`;
            total += parseFloat(item.valor);
        });
    
        csvContent += `\nTotal,,${total.toFixed(2)},,\n`;
    
        return csvContent;
    }
    
    
}

