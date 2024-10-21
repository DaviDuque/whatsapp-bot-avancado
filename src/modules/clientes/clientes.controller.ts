//clientes.controller.ts - cadstra cliente via whatsapp
import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { sendMessage } from '../../infra/integrations/twilio';
import '../../commands';
import { getCommand } from '../../commandManager';
import { verificarClientePorTelefone } from './clientes.repository';
import { formatarNumeroTelefone } from '../../utils/trata-telefone';
import { verificarEstadoCliente, atualizarEstadoCliente, limparEstadoCliente } from './clientes.repository';
import { cadastrarClienteController } from './clientes.service';
import { generateRandomCode } from '../../utils/Gera-codigo';
import { validarNome, validarCpfCnpj, validarEmail } from '../../utils/validation';
import { transcribe } from '../transcribe/transcribe.controler';
import { verificaTipoMsg } from '../../utils/verifica-tipo-msg';

// Armazenamento temporário para os dados do cliente em processo de cadastro
const dadosClientesTemporarios: { [key: string]: any } = {};

        export class Clientes {
            whatsapp = async (req: Request, res: Response) => {
                const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
                const TipoMSG = verificaTipoMsg(NumMedia, MediaContentType0, MediaUrl0);
                const [commandName, ...args] = Body.split(' ');
        
                const clienteCadastrado = await verificarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));
        
                if (!clienteCadastrado) {
                    const estadoAtual = verificarEstadoCliente(From);
                       
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
                        atualizarEstadoCliente(From, 'aguardando_nome');
                        sendMessage(To, From, 'Por favor, envie seu nome para continuar o cadastro.');
                    } else if (estadoAtual === 'aguardando_nome') {
                        const Transcribe = await transcribe(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
                        if (!Transcribe) return;
        
                        const nome = Transcribe; // Captura o nome transcrito
                        if (validarNome(nome)) { // Valida o nome
                            novoCliente.nome = nome; // Armazena o nome
                            atualizarEstadoCliente(From, 'confirmar_nome');
                            sendMessage(To, From, `Seu nome é ${nome}, está correto? (Sim/Não)`);
                        } else {
                            sendMessage(To, From, 'Nome inválido, por favor envie novamente.');
                        }
                    } else if (estadoAtual === 'confirmar_nome') {
                        if (Body.trim().toLowerCase() === 'sim') {
                            atualizarEstadoCliente(From, 'aguardando_email');
                            sendMessage(To, From, 'Perfeito! Agora, envie seu email.');
                        } else {
                            atualizarEstadoCliente(From, 'aguardando_nome');
                            sendMessage(To, From, 'Por favor, envie seu nome novamente.');
                        }
                    } else if (estadoAtual === 'aguardando_email') {
                        const Transcribe = await transcribe(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
                        if (!Transcribe) return;
        
                        const email = Transcribe; // Captura o email transcrito
                        if (validarEmail(email)) { // Valida o email
                            novoCliente.email = email; // Armazena o email
                            atualizarEstadoCliente(From, 'confirmar_email');
                            sendMessage(To, From, `Seu email é ${email}, está correto? (Sim/Não)`);
                        } else {
                            sendMessage(To, From, 'Email inválido, por favor envie novamente.');
                        }
                    } else if (estadoAtual === 'confirmar_email') {
                        if (Body.trim().toLowerCase() === 'sim') {
                            atualizarEstadoCliente(From, 'aguardando_cpf');
                            sendMessage(To, From, 'Perfeito! Agora, envie seu CPF.');
                        } else {
                            atualizarEstadoCliente(From, 'aguardando_email');
                            sendMessage(To, From, 'Por favor, envie seu email novamente.');
                        }
                    } else if (estadoAtual === 'aguardando_cpf') {
                        const cpf = Body; // Captura o CPF enviado
                        if (validarCpfCnpj(cpf)) { // Valida o CPF
                            novoCliente.cpf = cpf; // Armazena o CPF
                            atualizarEstadoCliente(From, 'confirmar_cpf');
                            sendMessage(To, From, `Seu CPF é ${cpf}, está correto? (Sim/Não)`);
                        } else {
                            sendMessage(To, From, 'CPF inválido, por favor envie novamente.');
                        }
                    } else if (estadoAtual === 'confirmar_cpf') {
                        if (Body.trim().toLowerCase() === 'sim') {
                            try {
                                const cadastro = await cadastrarClienteController(novoCliente);
                                if (typeof cadastro === 'object' && 'error' in cadastro) {
                                    atualizarEstadoCliente(From, 'aguardando_nome');
                                    sendMessage(To, From, 'Erro no cadastro. Tente novamente.');
                                } else {
                                    limparEstadoCliente(From);
                                    sendMessage(To, From, 'Cadastro realizado com sucesso!');
                                }
                            } catch (error) {
                                atualizarEstadoCliente(From, 'aguardando_nome');
                                sendMessage(To, From, 'Erro no cadastro. Tente novamente.');
                            }
                        } else {
                            atualizarEstadoCliente(From, 'aguardando_cpf');
                            sendMessage(To, From, 'Por favor, envie seu CPF novamente.');
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
        }
        