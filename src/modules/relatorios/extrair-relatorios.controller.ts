import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { ListarDespesaPorClienteControler, ListarReceitasPorClienteControler, ListarInvestimentosPorClienteControler } from './relatorios.service';
import { sendMessage, sendConfirmPadraoMessage } from '../../infra/integrations/twilio';
import '../../commands';
import { formatarNumeroTelefone } from '../../utils/trata-telefone';
import { saveReportToDatabase } from './relatorios.repository';
import { criarClientePorTelefone } from '../clientes/clientes.repository';
import { verificarEstado, atualizarEstado, limparEstado,  verificarClienteEstado } from '../../infra/states/states';
import { transcribe } from '../transcribe/transcribe.controler';
import { SummarizeServiceRelatorio } from '../../infra/integrations/summarize.service';
import { sendFileViaWhatsApp } from '../../infra/integrations/twilio';
import dayjs from 'dayjs';
import { GlobalState } from '../../infra/states/global-state';

export class Relatorios {
    whatsappRelatorio = async (req: Request, res: Response) => {
        const summarizeServiceRelatorio = new SummarizeServiceRelatorio();
        const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
        const globalState = GlobalState.getInstance();
        const condicao = globalState.getClientCondition();
        const id_cliente = await criarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));
        if(condicao == "relatorio"){
            await atualizarEstado(From, "aguardando_dados");
        }

        const cliente = verificarClienteEstado(id_cliente);
        const estadoAtual = await verificarEstado(From);

        if((estadoAtual == 'aguardando_continuacao' && Body =='N') || (estadoAtual == 'aguardando_continuacao' && Body =='n') ){
            globalState.setClientCondition("inicial");
            await sendMessage(To, From, "\u{1F522}Digite *8* para ver o menu");
        }

        if((estadoAtual == 'aguardando_continuacao' && Body =='S') || (estadoAtual == 'aguardando_continuacao' && Body =='s') ){
            await sendMessage(To, From, 
                    `\u{1F4CB}Para buscar um relatório, digite ou fale os detalhes:
*Data inicial*
*Data final*
`);
            await atualizarEstado(From, "aguardando_dados");
        }
        if(estadoAtual == 'aguardando_continuacao' 
            && Body !='N' 
            && Body !='n' 
            && Body !='S' 
            && Body !='s'
          ){
            await sendMessage(To, From, "\u{26A0}Não reconheci seu comando,Para extrair um relatório digite *Sim* ou voltar digite *Não*.");
        }

    if (!estadoAtual) {
        await sendMessage(To, From,  `\u{1F4CB}Para buscar um relatório, digite ou fale os detalhes:
*Data inicial*
*Data final*
            `);
        await atualizarEstado(From, "aguardando_dados");
    }

    if (estadoAtual === "aguardando_dados") {
            
        const Transcribe = await transcribe(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
        if (!Transcribe) return;
        const response = await summarizeServiceRelatorio.summarize(Transcribe);
        const [data_inicial, data_final] = response.split(',');
        const datStrIni: string = dayjs(data_inicial.replace(/["'\[\]\(\)]/g, '')).format('YYYY-MM-DD');
        const datStrFim: string = dayjs(data_final.replace(/["'\[\]\(\)]/g, '')).format('YYYY-MM-DD');
        
        if (!cliente) { return undefined; }

        globalState.setMensagem(`${response}`);

        try {
            if (!datStrIni || !datStrFim) {
                await sendMessage(To, From, "\u{26A0}Desculpe não entendi, forneça os dados corretos para extrair o relatório. Você pode digitar ou falar");
            } else {
                globalState.setClientCondition("relatorio_1");
                await atualizarEstado(From, "aguardando_confirmacao_dados");

                const dadosMsg = ` \u{1F4B5}Relatório a extrair: *Data inicial:${dayjs(datStrIni).format('DD-MM-YYYY')}* , *Data final:${dayjs(datStrFim).format('DD-MM-YYYY')}*`
                sendConfirmPadraoMessage(To, From, dadosMsg);
            }
        } catch (error) {
            await sendMessage(To, From, "\u{26A0}Houve um erro ao extrair o relatório. Por favor, tente novamente.");
        }
    }
        if (estadoAtual === 'aguardando_confirmacao_dados') {
            
            let dados = globalState.getMensagem();
            if(!dados)return null
            
            let [data_inicial, data_final] = dados.split(',');
            const id_cliente = await criarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));
            
                if (Body.toUpperCase() === 'S' || Body.trim() === 'Sim') {
                    if(cliente){
                        try {
                            const datStrIni: string = dayjs(data_inicial.replace(/["'\[\]\(\)]/g, '')).format('YYYY-MM-DD');
                            const datStrFim: string = dayjs(data_final.replace(/["'\[\]\(\)]/g, '')).format('YYYY-MM-DD');


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
            const id_cliente_string = parseInt(id_cliente);
            await saveReportToDatabase(id_cliente_string, "Relatório Completo", datStrIni, datStrFim, filePath);
            
            
            
            const resultado = { fileName, filePath};
            const dataExtra = new Date();

            if (fileName && filePath) {
                await sendFileViaWhatsApp(From, To, fileName);  
                console.log(">>>>>>>>>>>filename", fileName);
                /*await sendMessage(To, From, `
\u{1F4B9} Segue seu relatório! 
*Data extração:* ${dayjs(dataExtra).format('DD-MM-YYYY')}, 
*Data Inicial:*  ${dayjs(datStrIni).format('DD-MM-YYYY')}, 
*Data Final:*  ${dayjs(datStrFim).format('DD-MM-YYYY')}`);*/
//*Arquivo:*  ${fileName}
//, \n \u{1F4A1}Caso queira extrai outro relatório digite *4* ou para voltar digite *8* e para sair digite *9*`);
                await sendFileViaWhatsApp(From, To, fileName);  
                
                await sendMessage(To, From, `
\u{1F4B9} Segue seu relatório completo! 
*Data extração:* ${dayjs(dataExtra).format('DD-MM-YYYY')}, 
*Data Inicial:*  ${dayjs(datStrIni).format('DD-MM-YYYY')}, 
*Data Final:*  ${dayjs(datStrFim).format('DD-MM-YYYY')}`);
                await limparEstado(From);
                globalState.setClientCondition("inicial");  
                    }else{
                        await limparEstado(From);
                        globalState.setClientCondition("inicial");
                        await sendMessage(To, From, "\u{274C}Houve um erro 9 ao extrair o relatório. Por favor, tente novamente.");
                    }
                        } catch (error) {
                            await limparEstado(From);
                            globalState.setClientCondition("inicial");
                            await sendMessage(To, From, "\u{274C}Houve um erro 8 ao extrair o relatório. Por favor, tente novamente.");
                        }
                    }
                } else if (Body.toUpperCase() === 'N' || Body.trim() === 'Não') {
                    await sendMessage(To, From, "\u{274C}Cadastro de meta cancelado. Você pode tentar novamente.");
                    await atualizarEstado(From, "aguardando_dados");
                } else {
                    await sendMessage(To, From, "\u{26A0}Não reconheci sua resposta. Por favor, responda com *Sim* ou *Não*");
                }
            }
    

    };
}
