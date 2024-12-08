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
exports.Cartao = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const twilio_1 = require("../../infra/integrations/twilio");
require("../../commands");
const formata_dinheiro_1 = require("../../utils/formata-dinheiro");
const trata_telefone_1 = require("../../utils/trata-telefone");
const cartao_repository_1 = require("./cartao.repository");
const validation_1 = require("../../utils/validation");
const clientes_repository_1 = require("../clientes/clientes.repository");
const states_1 = require("../../infra/states/states");
const transcribe_controler_1 = require("../transcribe/transcribe.controler");
const summarize_service_1 = require("../../infra/integrations/summarize.service");
const global_state_1 = require("../../infra/states/global-state");
class Cartao {
    constructor() {
        this.whatsappCartao = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const summarizeServiceCartao = new summarize_service_1.SummarizeServiceCartao();
            const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
            const globalState = global_state_1.GlobalState.getInstance();
            const condicao = globalState.getClientCondition();
            const cliente_id = yield (0, clientes_repository_1.criarClientePorTelefone)((0, trata_telefone_1.formatarNumeroTelefone)(From.replace(/^whatsapp:/, '')));
            if (condicao == "cartao") {
                yield (0, states_1.atualizarEstado)(From, "aguardando_dados");
            }
            const cliente = (0, states_1.verificarClienteEstado)(cliente_id);
            const estadoAtual = yield (0, states_1.verificarEstado)(From);
            if ((estadoAtual == 'aguardando_continuacao' && Body == 'N') || (estadoAtual == 'aguardando_continuacao' && Body == 'n')) {
                globalState.setClientCondition("inicial");
                yield (0, twilio_1.sendMessage)(To, From, "Digite 8 para ver o menu");
            }
            if ((estadoAtual == 'aguardando_continuacao' && Body == 'S') || (estadoAtual == 'aguardando_continuacao' && Body == 's')) {
                yield (0, twilio_1.sendMessage)(To, From, `\u{1F4B6}Para cadastrar um cartão, digite ou fale os detalhes:
*Nome da cartão*
*Tipo débito ou crédito* 
*Banco*
*Limite total*
*Limite disponível*`);
                yield (0, states_1.atualizarEstado)(From, "aguardando_dados");
            }
            if (estadoAtual == 'aguardando_continuacao'
                && Body != 'N'
                && Body != 'n'
                && Body != 'S'
                && Body != 's') {
                yield (0, twilio_1.sendMessage)(To, From, "Não reconheci seu comando,Para cadastrar outro cartão digite 'S' ou voltar digite 'N'.");
            }
            if (!estadoAtual) {
                yield (0, twilio_1.sendMessage)(To, From, `\u{1F4B6}Para cadastrar um cartão, digite ou fale os detalhes:
*Nome da cartão*
*Tipo débito ou crédito* 
*Banco*
*Limite total*
*Limite disponível*`);
                yield (0, states_1.atualizarEstado)(From, "aguardando_dados");
            }
            if (estadoAtual === "aguardando_dados") {
                const Transcribe = yield (0, transcribe_controler_1.transcribe)(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
                if (!Transcribe)
                    return;
                const response = yield summarizeServiceCartao.summarize(Transcribe);
                let [nome_cartao, tipo, banco, limite_total, limite_disponivel] = response.split(',');
                const limiteValor = parseFloat(limite_total);
                const disponivelValor = parseFloat(limite_disponivel);
                if (!cliente) {
                    return undefined;
                }
                globalState.setMensagem(`${response}`);
                try {
                    const newNomeCartao = nome_cartao.replace(/["'\[\]\(\)]/g, '');
                    const newTipo = tipo.replace(/["'\[\]\(\)]/g, '');
                    const newBanco = banco.replace(/["'\[\]\(\)]/g, '');
                    if (!(0, validation_1.validarDescricao)(nome_cartao) || !(0, validation_1.validarValorTotal)(limiteValor) || !(0, validation_1.validarValorTotal)(disponivelValor) || newNomeCartao == null) {
                        yield (0, twilio_1.sendMessage)(To, From, "Desculpe não entendi, forneça os dados corretos do cartão. Você pode digitar ou falar");
                    }
                    else {
                        const formatLimiteValor = (0, formata_dinheiro_1.formatWithRegex)(limiteValor);
                        const formatDisponivelValor = (0, formata_dinheiro_1.formatWithRegex)(disponivelValor);
                        globalState.setClientCondition("cartao_1");
                        const dadosMsg = `\u{1F4B5}Cartão: *${newNomeCartao.trim()}*, *Tipo:${newTipo.trim()}*, *Banco:${newBanco.trim()}*, *Limite Total:${formatLimiteValor}*, *Limite Disponível:${formatDisponivelValor}*`;
                        yield (0, states_1.atualizarEstado)(From, "aguardando_confirmacao_dados");
                        (0, twilio_1.sendConfirmPadraoMessage)(To, From, dadosMsg);
                    }
                }
                catch (error) {
                    console.log("Erro em aguardando dados", error);
                    yield (0, twilio_1.sendMessage)(To, From, "Detectamos um erro ao cadastrar o cartão. Por favor, tente novamente.");
                }
            }
            if (estadoAtual === 'aguardando_confirmacao_dados') {
                let dados = globalState.getMensagem();
                if (!dados)
                    return null;
                let [nome_cartao, tipo, banco, limite_total, limite_diponivel] = dados.split(',');
                if (Body.toUpperCase() === 'S' || Body.trim() === 'Sim') {
                    if (cliente) {
                        try {
                            const newNomeCartao = nome_cartao.replace(/["'\[\]\(\)]/g, '');
                            const newTipo = tipo.replace(/["'\[\]\(\)]/g, '');
                            const newBanco = banco.replace(/["'\[\]\(\)]/g, '');
                            const limiteValor = parseFloat(limite_total);
                            const disponivelValor = parseFloat(limite_diponivel);
                            const resultado = yield (0, cartao_repository_1.cadastrarCartao)(cliente, newNomeCartao, newTipo, newBanco, limiteValor, disponivelValor);
                            if (resultado === null || resultado === void 0 ? void 0 : resultado.sucesso) {
                                yield (0, twilio_1.sendMessage)(To, From, `
                        *Cartão cadastrado com sucesso!* 
\u{1F4B6} *Cartão:* ${newNomeCartao.trim()}
\u{1F4F1} *Tipo:* ${newTipo.trim()}
\u{1F3E6} *Banco:* ${newBanco.trim()}
\u{1F4B5} *Limite total:*  ${(0, formata_dinheiro_1.formatWithRegex)(limiteValor)}
\u{1FA99} *Limite disponível:* ${(0, formata_dinheiro_1.formatWithRegex)(disponivelValor)} \n
\u{1F4A1}Para cadastrar outro cartão digite *6*, para voltar digite *8*, ou para sair digite *9*`);
                                yield (0, states_1.limparEstado)(From);
                                globalState.setClientCondition("inicial");
                            }
                            else {
                                console.error("erro ao salvar cartão", resultado);
                                yield (0, states_1.limparEstado)(From);
                                globalState.setClientCondition("inicial");
                                yield (0, twilio_1.sendMessage)(To, From, "Houve um erro ao cadastrar o cartão. Para tentar novamente digite *6* ou para sair digite *9*.");
                            }
                        }
                        catch (error) {
                            console.log("...ERRRROR>>>", error);
                            yield (0, states_1.limparEstado)(From);
                            globalState.setClientCondition("inicial");
                            yield (0, twilio_1.sendMessage)(To, From, "Ops. Houve um erro ao cadastrar o cartão. Para tentar novamente digite *6* ou para sair digite *9*.");
                        }
                    }
                }
                else if (Body.toUpperCase() === 'N' || Body.trim() === 'Não') {
                    yield (0, twilio_1.sendMessage)(To, From, "Cadastro de cartão cancelado. Você pode tentar novamente.");
                    yield (0, states_1.atualizarEstado)(From, "aguardando_dados");
                }
                else {
                    yield (0, twilio_1.sendMessage)(To, From, "Não reconheci sua resposta. Por favor, responda com *Sim* ou *Não*.");
                }
            }
        });
    }
}
exports.Cartao = Cartao;
