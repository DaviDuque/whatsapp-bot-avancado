"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clientes = void 0;
//clientes.controller.ts - cadstra cliente via whatsapp
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const twilio_1 = require("../../infra/integrations/twilio");
require("../../commands");
const commandManager_1 = require("../../commandManager");
const clientes_repository_1 = require("./clientes.repository");
const trata_telefone_1 = require("../../utils/trata-telefone");
const clientes_service_1 = require("./clientes.service");
const gera_codigo_1 = require("../../utils/gera-codigo");
const validation_1 = require("../../utils/validation");
const transcribe_controler_1 = require("../transcribe/transcribe.controler");
const verifica_tipo_msg_1 = require("../../utils/verifica-tipo-msg");
const states_1 = require("../../infra/states/states");
// Armazenamento temporário para os dados do cliente em processo de cadastro
const dadosClientesTemporarios = {};
class Clientes {
    constructor() {
        this.whatsapp = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
            const TipoMSG = (0, verifica_tipo_msg_1.verificaTipoMsg)(NumMedia, MediaContentType0, MediaUrl0);
            const [commandName, ...args] = Body.split(' ');
            const clienteCadastrado = yield (0, clientes_repository_1.verificarClientePorTelefone)((0, trata_telefone_1.formatarNumeroTelefone)(From.replace(/^whatsapp:/, '')));
            if (!clienteCadastrado) {
                const estadoAtual = yield (0, states_1.verificarEstado)(From);
                //const estadoAtual = verificarEstadoCliente(From);
                if (!dadosClientesTemporarios[From]) {
                    dadosClientesTemporarios[From] = {
                        id_endereco: 1,
                        senha: null,
                        codigo_indicacao: null
                    };
                }
                console.log("estado -------", estadoAtual);
                const novoCliente = dadosClientesTemporarios[From];
                novoCliente.telefone = (0, trata_telefone_1.formatarNumeroTelefone)(From.replace(/^whatsapp:/, ''));
                novoCliente.codigo_proprio = (0, gera_codigo_1.generateRandomCode)(12, novoCliente.telefone.slice(-5));
                if (!estadoAtual) {
                    console.log("!!estado  -------", estadoAtual);
                    (0, states_1.atualizarEstado)(From, 'aguardando_nome');
                    (0, twilio_1.sendMessage)(To, From, 'Por favor, envie seu nome para continuar o cadastro.');
                }
                else if (estadoAtual === 'aguardando_nome') {
                    const Transcribe = yield (0, transcribe_controler_1.transcribe)(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
                    if (!Transcribe)
                        return;
                    const nome = Transcribe; // Captura o nome transcrito
                    if ((0, validation_1.validarNome)(nome)) { // Valida o nome
                        novoCliente.nome = nome; // Armazena o nome
                        (0, states_1.atualizarEstado)(From, 'confirmar_nome');
                        (0, twilio_1.sendMessage)(To, From, `Seu nome é ${nome}, está correto? (Sim/Não)`);
                    }
                    else {
                        (0, twilio_1.sendMessage)(To, From, 'Nome inválido, por favor envie novamente.');
                    }
                }
                else if (estadoAtual === 'confirmar_nome') {
                    if (Body.trim().toLowerCase() === 'sim') {
                        (0, states_1.atualizarEstado)(From, 'aguardando_email');
                        (0, twilio_1.sendMessage)(To, From, 'Perfeito! Agora, envie seu email.');
                    }
                    else {
                        (0, states_1.atualizarEstado)(From, 'aguardando_nome');
                        (0, twilio_1.sendMessage)(To, From, 'Por favor, envie seu nome novamente.');
                    }
                }
                else if (estadoAtual === 'aguardando_email') {
                    const Transcribe = yield (0, transcribe_controler_1.transcribe)(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
                    if (!Transcribe)
                        return;
                    const email = Transcribe; // Captura o email transcrito
                    if ((0, validation_1.validarEmail)(email)) { // Valida o email
                        novoCliente.email = email; // Armazena o email
                        (0, states_1.atualizarEstado)(From, 'confirmar_email');
                        (0, twilio_1.sendMessage)(To, From, `Seu email é ${email}, está correto? (Sim/Não)`);
                    }
                    else {
                        (0, twilio_1.sendMessage)(To, From, 'Email inválido, por favor envie novamente.');
                    }
                }
                else if (estadoAtual === 'confirmar_email') {
                    if (Body.trim().toLowerCase() === 'sim') {
                        (0, states_1.atualizarEstado)(From, 'aguardando_cpf');
                        (0, twilio_1.sendMessage)(To, From, 'Perfeito! Agora, envie seu CPF.');
                    }
                    else {
                        (0, states_1.atualizarEstado)(From, 'aguardando_email');
                        (0, twilio_1.sendMessage)(To, From, 'Por favor, envie seu email novamente.');
                    }
                }
                else if (estadoAtual === 'aguardando_cpf') {
                    const cpf = Body; // Captura o CPF enviado
                    if ((0, validation_1.validarCpfCnpj)(cpf)) { // Valida o CPF
                        novoCliente.cpf = cpf; // Armazena o CPF
                        (0, states_1.atualizarEstado)(From, 'confirmar_cpf');
                        (0, twilio_1.sendMessage)(To, From, `Seu CPF é ${cpf}, está correto? (Sim/Não)`);
                    }
                    else {
                        (0, twilio_1.sendMessage)(To, From, 'CPF inválido, por favor envie novamente.');
                    }
                }
                else if (estadoAtual === 'confirmar_cpf') {
                    if (Body.trim().toLowerCase() === 'sim') {
                        try {
                            const cadastro = yield (0, clientes_service_1.cadastrarClienteController)(novoCliente);
                            if (typeof cadastro === 'object' && 'error' in cadastro) {
                                (0, states_1.atualizarEstado)(From, 'aguardando_nome');
                                (0, twilio_1.sendMessage)(To, From, 'Erro no cadastro. Tente novamente.');
                            }
                            else {
                                (0, states_1.limparEstado)(From);
                                (0, twilio_1.sendMessage)(To, From, 'Cadastro realizado com sucesso!');
                            }
                        }
                        catch (error) {
                            (0, states_1.atualizarEstado)(From, 'aguardando_nome');
                            (0, twilio_1.sendMessage)(To, From, 'Erro no cadastro. Tente novamente.');
                        }
                    }
                    else {
                        (0, states_1.atualizarEstado)(From, 'aguardando_cpf');
                        (0, twilio_1.sendMessage)(To, From, 'Por favor, envie seu CPF novamente.');
                    }
                }
            }
            else {
                const command = (0, commandManager_1.getCommand)(commandName);
                if (command && typeof command.execute === 'function') {
                    const response = command.execute(args);
                    (0, twilio_1.sendMessage)(To, From, response);
                }
                else {
                    (0, twilio_1.sendMessage)(To, From, 'OPS! Não identificamos a mensagem. Envie "help" para lista de comandos.');
                }
            }
        });
    }
}
exports.Clientes = Clientes;
