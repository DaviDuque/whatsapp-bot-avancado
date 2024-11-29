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
const global_state_1 = require("../../infra/states/global-state");
const globalState = global_state_1.GlobalState.getInstance();
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
                if (!dadosClientesTemporarios[From]) {
                    dadosClientesTemporarios[From] = {
                        id_endereco: 1,
                        senha: null,
                        codigo_indicacao: null
                    };
                }
                const novoCliente = dadosClientesTemporarios[From];
                novoCliente.telefone = (0, trata_telefone_1.formatarNumeroTelefone)(From.replace(/^whatsapp:/, ''));
                novoCliente.codigo_proprio = (0, gera_codigo_1.generateRandomCode)(12, novoCliente.telefone.slice(-5));
                if (!estadoAtual) {
                    (0, states_1.atualizarEstado)(From, 'aguardando_nome');
                    (0, twilio_1.sendMessage)(To, From, '*Ola!* \u{1F495}Seja bem vindo a seu controle financeiro inteligente. \u{1F914}Vi aqui que você ainda não cadastrou. Por favor, envie seu *nome* para iniciar o cadastro. \u{1F44D}Você pode falar ou digitar');
                }
                else if (estadoAtual === 'aguardando_nome') {
                    const Transcribe = yield (0, transcribe_controler_1.transcribe)(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
                    if (!Transcribe)
                        return;
                    const nome = Transcribe;
                    if ((0, validation_1.validarNome)(nome)) {
                        novoCliente.nome = nome;
                        (0, states_1.atualizarEstado)(From, 'confirmar_nome');
                        let dadosMsg = `\u{1F49C} Seu nome é ${nome}, está correto?`;
                        (0, twilio_1.sendConfirmPadraoMessage)(To, From, dadosMsg);
                    }
                    else {
                        (0, twilio_1.sendMessage)(To, From, '\u{274C}Nome inválido, por favor envie novamente. Você pode falar ou digitar');
                    }
                }
                else if (estadoAtual === 'confirmar_nome') {
                    if (Body.trim().toLowerCase() === 'sim') {
                        (0, states_1.atualizarEstado)(From, 'aguardando_email');
                        (0, twilio_1.sendMessage)(To, From, '\u{1F60E} Perfeito! Agora, envie seu *email*.');
                    }
                    else {
                        (0, states_1.atualizarEstado)(From, 'aguardando_nome');
                        (0, twilio_1.sendMessage)(To, From, '\u{1F534}Por favor, envie seu *nome* novamente.');
                    }
                }
                else if (estadoAtual === 'aguardando_email') {
                    const Transcribe = yield (0, transcribe_controler_1.transcribe)(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
                    if (!Transcribe)
                        return;
                    const email = Transcribe;
                    if ((0, validation_1.validarEmail)(email)) {
                        novoCliente.email = email;
                        (0, states_1.atualizarEstado)(From, 'confirmar_email');
                        let dadosMsg = `Seu \u{1F4BB} *email* \u{1F4BB} é ${email}, está correto?`;
                        (0, twilio_1.sendConfirmPadraoMessage)(To, From, dadosMsg);
                    }
                    else {
                        (0, twilio_1.sendMessage)(To, From, '\u{274C}Email inválido, por favor envie novamente.');
                    }
                }
                else if (estadoAtual === 'confirmar_email') {
                    if (Body.trim().toLowerCase() === 'sim') {
                        (0, states_1.atualizarEstado)(From, 'aguardando_cpf');
                        (0, twilio_1.sendMessage)(To, From, '\u{1F60E}Perfeito! Agora, envie seu *CPF*.');
                    }
                    else {
                        (0, states_1.atualizarEstado)(From, 'aguardando_email');
                        (0, twilio_1.sendMessage)(To, From, '\u{26A0}Por favor, envie seu *email* novamente.');
                    }
                }
                else if (estadoAtual === 'aguardando_cpf') {
                    const cpf = Body;
                    if ((0, validation_1.validarCpfCnpj)(cpf)) {
                        novoCliente.cpf = cpf.replace(/[^\w\s]/g, "");
                        (0, states_1.atualizarEstado)(From, 'confirmar_cpf');
                        let dadosMsg = `Seu \u{1F522} *CPF* \u{1F522} é ${cpf}, está correto?`;
                        (0, twilio_1.sendConfirmPadraoMessage)(To, From, dadosMsg);
                    }
                    else {
                        (0, twilio_1.sendMessage)(To, From, '\u{274C} CPF inválido, por favor envie novamente.');
                    }
                }
                else if (estadoAtual === 'confirmar_cpf') {
                    if (Body.trim().toLowerCase() === 'sim') {
                        try {
                            const cadastro = yield (0, clientes_service_1.cadastrarClienteController)(novoCliente);
                            if (typeof cadastro === 'object' && 'error' in cadastro) {
                                (0, states_1.atualizarEstado)(From, 'aguardando_nome');
                                (0, twilio_1.sendMessage)(To, From, '\u{274C}Erro no cadastro. Tente novamente.');
                            }
                            else {
                                (0, states_1.limparEstado)(From);
                                globalState.setClientCondition("pagamentos");
                                (0, twilio_1.sendConfirmPadraoMessage)(To, From, '\u{1F64C}Cadastro realizado com sucesso! confirme para prosseguir para o pagamento');
                                //sendMessage(To, From, '\u{1F64C}Cadastro realizado com sucesso!');
                            }
                        }
                        catch (error) {
                            (0, states_1.atualizarEstado)(From, 'aguardando_nome');
                            (0, twilio_1.sendMessage)(To, From, '\u{274C}Erro no cadastro. Tente novamente.');
                        }
                    }
                    else {
                        (0, states_1.atualizarEstado)(From, 'aguardando_cpf');
                        (0, twilio_1.sendMessage)(To, From, '\u{26A0}Por favor, envie seu CPF novamente.');
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
        this.cadastrarCliente = (req, res) => __awaiter(this, void 0, void 0, function* () {
            //novoCliente.telefone = formatarNumeroTelefone(From.replace(/^whatsapp:/, ''));
            //novoCliente.codigo_proprio = generateRandomCode(12, novoCliente.telefone.slice(-5));
            try {
                const cliente = yield (0, clientes_service_1.processarCliente)(req.body);
                res.status(201).json(cliente);
            }
            catch (error) {
                res.status(500).json({ error: error });
            }
        });
    }
}
exports.Clientes = Clientes;
