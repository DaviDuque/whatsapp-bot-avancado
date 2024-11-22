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
exports.Conta = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const twilio_1 = require("../../infra/integrations/twilio");
require("../../commands");
const trata_telefone_1 = require("../../utils/trata-telefone");
const conta_repository_1 = require("./conta.repository");
const validation_1 = require("../../utils/validation");
const formata_dinheiro_1 = require("../../utils/formata-dinheiro");
const clientes_repository_1 = require("../clientes/clientes.repository");
const states_1 = require("../../infra/states/states");
const transcribe_controler_1 = require("../transcribe/transcribe.controler");
const summarize_service_1 = require("../../infra/integrations/summarize.service");
const global_state_1 = require("../../infra/states/global-state");
class Conta {
    constructor() {
        this.whatsapp = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const summarizeServiceConta = new summarize_service_1.SummarizeServiceConta();
            const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
            const globalState = global_state_1.GlobalState.getInstance();
            const mensagem = globalState.getMensagem();
            const condicao = globalState.getClientCondition();
            const cliente_id = yield (0, clientes_repository_1.criarClientePorTelefone)((0, trata_telefone_1.formatarNumeroTelefone)(From.replace(/^whatsapp:/, '')));
            if (condicao == "conta") {
                yield (0, states_1.atualizarEstado)(From, "aguardando_dados");
            }
            const cliente = (0, states_1.verificarClienteEstado)(cliente_id);
            const estadoAtual = yield (0, states_1.verificarEstado)(From);
            if ((estadoAtual == 'aguardando_continuacao' && Body == 'N') || (estadoAtual == 'aguardando_continuacao' && Body == 'n')) {
                globalState.setClientCondition("inicial");
                yield (0, twilio_1.sendMessage)(To, From, "\u{1F4F1} Digite \u{0038}\u{FE0F}\u{20E3} para ver o menu");
            }
            if ((estadoAtual == 'aguardando_continuacao' && Body == 'S') || (estadoAtual == 'aguardando_continuacao' && Body == 's')) {
                yield (0, twilio_1.sendMessage)(To, From, `\u{1F3E6} Para cadastrar uma conta bancária, digite ou fale os detalhes:
*Nome da conta*
*tipo:* Corrente/poupança
*banco*
*limite*
*saldo*
                     `);
                yield (0, states_1.atualizarEstado)(From, "aguardando_dados");
            }
            if (estadoAtual == 'aguardando_continuacao'
                && Body != 'N'
                && Body != 'n'
                && Body != 'S'
                && Body != 's') {
                yield (0, twilio_1.sendMessage)(To, From, "\u{26A0}Não reconheci seu comando,Para cadastrar outra conta digite 'S' ou voltar digite 'N'.");
            }
            if (!estadoAtual) {
                yield (0, twilio_1.sendMessage)(To, From, `\u{1F3E6} Para cadastrar uma conta bancária, digite ou fale os detalhes:
*Nome da conta*
*Tipo:* Corrente/poupança
*Banco*
*Limite*
*Saldo*
                     `);
                yield (0, states_1.atualizarEstado)(From, "aguardando_dados");
            }
            if (estadoAtual === "aguardando_dados") {
                const Transcribe = yield (0, transcribe_controler_1.transcribe)(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
                if (!Transcribe)
                    return;
                const response = yield summarizeServiceConta.summarize(Transcribe);
                let [nome_conta, tipo, banco, limite, saldo] = response.split(',');
                const limiteValor = parseFloat(limite);
                const saldoValor = parseFloat(saldo);
                if (!cliente) {
                    return undefined;
                }
                globalState.setMensagem(`${response}`);
                try {
                    const newNomeConta = nome_conta.replace(/["'\[\]\(\)]/g, '');
                    const newTipo = tipo.replace(/["'\[\]\(\)]/g, '');
                    const newBanco = banco.replace(/["'\[\]\(\)]/g, '');
                    if (!(0, validation_1.validarDescricao)(nome_conta) || !(0, validation_1.validarValorTotal)(limiteValor) || !(0, validation_1.validarValorTotal)(saldoValor) || newNomeConta == null) {
                        yield (0, twilio_1.sendMessage)(To, From, "\u{26A0}Desculpe não entendi, forneça os dados corretos da conta. Você pode digitar ou falar");
                    }
                    else {
                        globalState.setClientCondition("conta_1");
                        const formatLimiteValor = (0, formata_dinheiro_1.formatWithRegex)(limiteValor);
                        const formatSaldoValor = (0, formata_dinheiro_1.formatWithRegex)(saldoValor);
                        yield (0, states_1.atualizarEstado)(From, "aguardando_confirmacao_dados");
                        const dadosMsg = ` \u{1F4B5}Conta: *${newNomeConta.trim()}*, *tipo:${newTipo.trim()}*, *Banco:${newBanco.trim()}*, *Limite:${formatLimiteValor}*, *Saldo:${formatSaldoValor}*`;
                        (0, twilio_1.sendConfirmPadraoMessage)(To, From, dadosMsg);
                    }
                }
                catch (error) {
                    console.log("erro cadastro contas", error);
                    yield (0, twilio_1.sendMessage)(To, From, "\u{274C}Houve um erro ao cadastrar a conta. Por favor, tente novamente.");
                }
            }
            if (estadoAtual === 'aguardando_confirmacao_dados') {
                let dados = globalState.getMensagem();
                if (!dados)
                    return null;
                let [nome_conta, tipo, banco, limite, saldo] = dados.split(',');
                if (Body.toUpperCase() === 'S' || Body.trim() === 'Sim') {
                    if (cliente) {
                        try {
                            const newNomeConta = nome_conta.replace(/["'\[\]\(\)]/g, '');
                            const newTipo = tipo.replace(/["'\[\]\(\)]/g, '');
                            const newBanco = banco.replace(/["'\[\]\(\)]/g, '');
                            const limiteValor = parseFloat(limite);
                            const saldoValor = parseFloat(saldo);
                            const formatLimiteValor = (0, formata_dinheiro_1.formatWithRegex)(limiteValor);
                            const formatSaldoValor = (0, formata_dinheiro_1.formatWithRegex)(saldoValor);
                            const resultado = yield (0, conta_repository_1.cadastrarConta)(cliente, newNomeConta, newTipo, newBanco, limiteValor, saldoValor);
                            if (resultado === null || resultado === void 0 ? void 0 : resultado.sucesso) {
                                yield (0, twilio_1.sendMessage)(To, From, `
*Conta cadastrada com sucesso!* 
*Conta:* ${newNomeConta.trim()}
*Tipo:* ${newTipo.trim()}
*Banco:* ${newBanco.trim()}
*Limite:*  ${formatLimiteValor}
*Saldo:* ${formatSaldoValor} \n
\u{1F4A1}Para cadastrar outra Conta digite *7*, para voltar digite *8* ou para sair digite *9*`);
                                yield (0, states_1.limparEstado)(From);
                                globalState.setClientCondition("inicial");
                            }
                            else {
                                console.error("erro ao salvar conta", resultado);
                                yield (0, states_1.limparEstado)(From);
                                globalState.setClientCondition("inicial");
                                yield (0, twilio_1.sendMessage)(To, From, "\u{274C}Houve um erro ao cadastrar a conta. Para tentar novamente digite *6* ou para sair digite *9*.");
                            }
                        }
                        catch (error) {
                            yield (0, twilio_1.sendMessage)(To, From, "\u{274C}Houve um erro ao cadastrar a conta. Por favor, tente novamente.");
                        }
                    }
                }
                else if (Body.toUpperCase() === 'N' || Body.trim() === 'Não') {
                    yield (0, twilio_1.sendMessage)(To, From, "\u{274C}Cadastro de conta cancelado. Você pode tentar novamente.");
                    yield (0, states_1.atualizarEstado)(From, "aguardando_dados");
                }
                else {
                    yield (0, twilio_1.sendMessage)(To, From, "\u{26A0} Não reconheci sua resposta. Por favor, responda com 'Sim' para sim ou 'Não' para não.");
                }
            }
        });
    }
}
exports.Conta = Conta;
