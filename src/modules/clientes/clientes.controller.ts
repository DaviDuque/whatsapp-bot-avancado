//clientes.controller.ts - cadstra cliente via whatsapp
import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { sendMessage, sendConfirmPadraoMessage } from '../../infra/integrations/twilio';
import '../../commands';
import { getCommand } from '../../commandManager';
import { verificarClientePorTelefone } from './clientes.repository';
import { formatarNumeroTelefone } from '../../utils/trata-telefone';
import { cadastrarClienteController, processarCliente } from './clientes.service';
import { generateRandomCode } from '../../utils/gera-codigo';
import { validarNome, validarCpfCnpj, validarEmail } from '../../utils/validation';
import { transcribe } from '../transcribe/transcribe.controler';
import { verificaTipoMsg } from '../../utils/verifica-tipo-msg';
import { verificarEstado, atualizarEstado, limparEstado } from '../../infra/states/states';
import { GlobalState } from '../../infra/states/global-state';

const globalState = GlobalState.getInstance();
const dadosClientesTemporarios: { [key: string]: any } = {};

        export class Clientes {
            whatsapp = async (req: Request, res: Response) => {
                const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
                const TipoMSG = verificaTipoMsg(NumMedia, MediaContentType0, MediaUrl0);
                const [commandName, ...args] = Body.split(' ');
        
                const clienteCadastrado = await verificarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));
                if (!clienteCadastrado) {
                    const estadoAtual = await verificarEstado(From);
               
                    if (!dadosClientesTemporarios[From]) {
                        dadosClientesTemporarios[From] = {
                            id_endereco: 1, 
                            senha: null,
                            codigo_indicacao: null
                        };
                    }
                    const novoCliente = dadosClientesTemporarios[From];
                    novoCliente.telefone = formatarNumeroTelefone(From.replace(/^whatsapp:/, ''));
                    novoCliente.codigo_proprio = generateRandomCode(12, novoCliente.telefone.slice(-5));
        
                    if (!estadoAtual) {
                        atualizarEstado(From, 'aguardando_nome');
                        sendMessage(To, From, '*Ola!* \u{1F495}Seja bem vindo a seu controle financeiro inteligente. \u{1F914}Vi aqui que você ainda não cadastrou. Por favor, envie seu *nome* para iniciar o cadastro. \u{1F44D}Você pode falar ou digitar');
                    } else if (estadoAtual === 'aguardando_nome') {
                        const Transcribe = await transcribe(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
                        if (!Transcribe) return;
        
                        const nome = Transcribe; 
                        if (validarNome(nome)) { 
                            novoCliente.nome = nome; 
                            atualizarEstado(From, 'confirmar_nome');
                            let dadosMsg = `\u{1F49C} Seu nome é ${nome}, está correto?`;
                            sendConfirmPadraoMessage(To, From, dadosMsg); 
                        } else {
                            sendMessage(To, From, '\u{274C}Nome inválido, por favor envie novamente. Você pode falar ou digitar');
                        }
                    } else if (estadoAtual === 'confirmar_nome') {
                        if (Body.trim().toLowerCase() === 'sim') {
                            atualizarEstado(From, 'aguardando_email');
                            sendMessage(To, From, '\u{1F60E} Perfeito! Agora, envie seu *email*.');
                        } else {
                            atualizarEstado(From, 'aguardando_nome');
                            sendMessage(To, From, '\u{1F534}Por favor, envie seu *nome* novamente.');
                        }
                    } else if (estadoAtual === 'aguardando_email') {
                        const Transcribe = await transcribe(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
                        if (!Transcribe) return;
        
                        const email = Transcribe; 
                        if (validarEmail(email)) {
                            novoCliente.email = email; 
                            atualizarEstado(From, 'confirmar_email');
                            let dadosMsg = `Seu \u{1F4BB} *email* \u{1F4BB} é ${email}, está correto?`;
                            sendConfirmPadraoMessage(To, From, dadosMsg); 
                        } else {
                            sendMessage(To, From, '\u{274C}Email inválido, por favor envie novamente.');
                        }
                    } else if (estadoAtual === 'confirmar_email') {
                        if (Body.trim().toLowerCase() === 'sim') {
                            atualizarEstado(From, 'aguardando_cpf');
                            sendMessage(To, From, '\u{1F60E}Perfeito! Agora, envie seu *CPF*.');
                        } else {
                            atualizarEstado(From, 'aguardando_email');
                            sendMessage(To, From, '\u{26A0}Por favor, envie seu *email* novamente.');
                        }
                    } else if (estadoAtual === 'aguardando_cpf') {
                        const cpf = Body;
                        if (validarCpfCnpj(cpf)) { 
                            novoCliente.cpf = cpf.replace(/[^\w\s]/g, ""); 
                            atualizarEstado(From, 'confirmar_cpf');
                            let dadosMsg = `Seu \u{1F522} *CPF* \u{1F522} é ${cpf}, está correto?`;
                            sendConfirmPadraoMessage(To, From, dadosMsg); 
                        } else {
                            sendMessage(To, From, '\u{274C} CPF inválido, por favor envie novamente.');
                        }
                    } else if (estadoAtual === 'confirmar_cpf') {
                        if (Body.trim().toLowerCase() === 'sim') {
                            try {
                                const cadastro = await cadastrarClienteController(novoCliente);
                                if (typeof cadastro === 'object' && 'error' in cadastro) {
                                    atualizarEstado(From, 'aguardando_nome');
                                    sendMessage(To, From, '\u{274C}Erro no cadastro. Tente novamente.');
                                } else {
                                    limparEstado(From);
                                    globalState.setClientCondition("pagamentos");
                                    sendConfirmPadraoMessage(To, From, '\u{1F64C}Cadastro realizado com sucesso! confirme para prosseguir para o pagamento');
                                    //sendMessage(To, From, '\u{1F64C}Cadastro realizado com sucesso!');
                                }
                            } catch (error) {
                                atualizarEstado(From, 'aguardando_nome');
                                sendMessage(To, From, '\u{274C}Erro no cadastro. Tente novamente.');
                            }
                        } else {
                            atualizarEstado(From, 'aguardando_cpf');
                            sendMessage(To, From, '\u{26A0}Por favor, envie seu CPF novamente.');
                        }
                    }
                } else {
                    const command = getCommand(commandName);
                    if (command && typeof command.execute === 'function') {
                        const response = command.execute(args);
                        sendMessage(To, From, response); 
                    } else {
                        sendMessage(To, From, 'OPS! Não identificamos a mensagem. Envie "help" para lista de comandos.');
                    }
                }
            }

            //cadastrarCliente não finalizado - uso na via API
            cadastrarCliente  = async (req: Request, res: Response) => {
                //novoCliente.telefone = formatarNumeroTelefone(From.replace(/^whatsapp:/, ''));
                //novoCliente.codigo_proprio = generateRandomCode(12, novoCliente.telefone.slice(-5));
                try {
                    const cliente = await processarCliente(req.body);
                    res.status(201).json(cliente);
                } catch (error) {
                    res.status(500).json({ error: error });
                }

            }
        }
        