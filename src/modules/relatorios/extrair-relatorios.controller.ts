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
import { gerarRelatorioExcel } from './relatorios.repository';
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
        const URL = process.env.FILE_URL;
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
        console.log("relatorio>>>>>>>>", Transcribe);
        const response = await summarizeServiceRelatorio.summarize(Transcribe);
        console.log("relatorio>>>>>>>>", response);
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

                const dadosMsg = ` \u{1F4B5}Relatório a extrair periodo: *Inicial:${dayjs(datStrIni).format('DD-MM-YYYY')}* , *Final:${dayjs(datStrFim).format('DD-MM-YYYY')}*`
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
                        const responseGerarExcell = await gerarRelatorioExcel(id_cliente, data_inicial, data_final);
                        const dataExtra = new Date();

                        if (responseGerarExcell.fileName) {
                        await sendMessage(To, From, `
\u{1F4B9} Segue seu relatório! 
*Data extração:* ${dayjs(dataExtra).format('DD-MM-YYYY')}, 
*Data Inicial:*  ${dayjs(datStrIni).format('DD-MM-YYYY')}, 
*Data Final:*  ${dayjs(datStrFim).format('DD-MM-YYYY')},
*Arquivo:*  ${URL}/file/${responseGerarExcell.fileName} \n
\u{1F4A1} Caso queira extrai outro relatório digite *4* ou para voltar digite *8* e para sair digite *9*`);
     
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
                await atualizarEstado(From, "aguardando_dados");
                await sendMessage(To, From, "\u{274C}Cadastro de Relatório cancelado. Você pode tentar novamente.");
                
            } else {
                await sendMessage(To, From, "\u{26A0}Não reconheci sua resposta. Por favor, responda com *Sim* ou *Não*");
                }
        }
    };
}
