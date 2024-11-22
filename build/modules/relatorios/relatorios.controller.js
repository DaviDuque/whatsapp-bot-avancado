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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Meta = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const twilio_1 = require("../../infra/integrations/twilio");
require("../../commands");
const trata_telefone_1 = require("../../utils/trata-telefone");
const formata_dinheiro_1 = require("../../utils/formata-dinheiro");
const metas_repository_1 = require("./metas.repository");
const validation_1 = require("../../utils/validation");
const clientes_repository_1 = require("../clientes/clientes.repository");
const states_1 = require("../../infra/states/states");
const transcribe_controler_1 = require("../transcribe/transcribe.controler");
const summarize_service_1 = require("../../infra/integrations/summarize.service");
const dayjs_1 = __importDefault(require("dayjs"));
const global_state_1 = require("../../infra/states/global-state");
class Meta {
    constructor() {
        this.whatsappMeta = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const summarizeServiceMeta = new summarize_service_1.SummarizeServiceMeta();
            const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
            const globalState = global_state_1.GlobalState.getInstance();
            const condicao = globalState.getClientCondition();
            const cliente_id = yield (0, clientes_repository_1.criarClientePorTelefone)((0, trata_telefone_1.formatarNumeroTelefone)(From.replace(/^whatsapp:/, '')));
            if (condicao == "meta") {
                yield (0, states_1.atualizarEstado)(From, "aguardando_dados");
            }
            const cliente = (0, states_1.verificarClienteEstado)(cliente_id);
            const estadoAtual = yield (0, states_1.verificarEstado)(From);
            if ((estadoAtual == 'aguardando_continuacao' && Body == 'N') || (estadoAtual == 'aguardando_continuacao' && Body == 'n')) {
                globalState.setClientCondition("inicial");
                yield (0, twilio_1.sendMessage)(To, From, "\u{1F522}Digite *8* para ver o menu");
            }
            if ((estadoAtual == 'aguardando_continuacao' && Body == 'S') || (estadoAtual == 'aguardando_continuacao' && Body == 's')) {
                yield (0, twilio_1.sendMessage)(To, From, `
\u{1F60E}Para definir um meta, digite ou fale os detalhes:
*Nome da meta*
*valor_objetivo*
*valor_atual*
*data_limite*`);
                yield (0, states_1.atualizarEstado)(From, "aguardando_dados");
            }
            if (estadoAtual == 'aguardando_continuacao'
                && Body != 'N'
                && Body != 'n'
                && Body != 'S'
                && Body != 's') {
                yield (0, twilio_1.sendMessage)(To, From, "Não reconheci seu comando,Para cadastrar outra meta digite *Sim* ou voltar digite *Não*.");
            }
            if (!estadoAtual) {
                yield (0, twilio_1.sendMessage)(To, From, `\u{1F4B7}Para cadastrar uma meta, digite ou fale os detalhes:
*Nome da meta*
*valor_objetivo*
*valor_atual*
*data_limite*
                     `);
                yield (0, states_1.atualizarEstado)(From, "aguardando_dados");
            }
            if (estadoAtual === "aguardando_dados") {
                const Transcribe = yield (0, transcribe_controler_1.transcribe)(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
                if (!Transcribe)
                    return;
                const response = yield summarizeServiceMeta.summarize(Transcribe);
                let [descricao, valor_objetivo, valor_atual, data_limite] = response.split(',');
                const datStr = data_limite.replace(/["'\[\]\(\)]/g, '');
                let limiteValor = (0, dayjs_1.default)(datStr).format('YYYY-MM-DD');
                const ValorAtual = parseFloat(valor_atual);
                const ValorObjetivo = parseFloat(valor_objetivo);
                if (!cliente) {
                    return undefined;
                }
                globalState.setMensagem(`${response}`);
                try {
                    const newDescricao = descricao.replace(/["'\[\]\(\)]/g, '');
                    if (!(0, validation_1.validarDescricao)(newDescricao) || !(0, validation_1.validarValorTotal)(ValorAtual) || !(0, validation_1.validarValorTotal)(ValorObjetivo) || descricao == null) {
                        yield (0, twilio_1.sendMessage)(To, From, "\u{26A0}Desculpe não entendi, forneça os dados corretos do meta. Você pode digitar ou falar");
                    }
                    else {
                        globalState.setClientCondition("meta_1");
                        yield (0, states_1.atualizarEstado)(From, "aguardando_confirmacao_dados");
                        const dadosMsg = ` \u{1F4B5}Meta definida:${newDescricao.trim()}, *Valor Objetivo:${(0, formata_dinheiro_1.formatWithRegex)(ValorObjetivo)}*, *Valor Atual:${(0, formata_dinheiro_1.formatWithRegex)(ValorAtual)}*, *Data Limite:${(0, dayjs_1.default)(limiteValor).format('DD-MM-YYYY')}*`;
                        (0, twilio_1.sendConfirmPadraoMessage)(To, From, dadosMsg);
                    }
                }
                catch (error) {
                    yield (0, twilio_1.sendMessage)(To, From, "\u{26A0}Houve um erro ao cadastrar o meta. Por favor, tente novamente.");
                }
            }
            if (estadoAtual === 'aguardando_confirmacao_dados') {
                let dados = globalState.getMensagem();
                if (!dados)
                    return null;
                let [descricao, valor_objetivo, valor_atual, data_limite] = dados.split(',');
                if (Body.toUpperCase() === 'S' || Body.trim() === 'Sim') {
                    if (cliente) {
                        try {
                            const limiteValor = data_limite.replace(/["'\[\]\(\)]/g, '');
                            const newDescricao = descricao.replace(/["'\[\]\(\)]/g, '');
                            const ValorAtual = parseFloat(valor_atual);
                            const ValorObjetivo = parseFloat(valor_objetivo);
                            const resultado = yield (0, metas_repository_1.cadastrarMeta)(cliente, newDescricao, ValorObjetivo, ValorAtual, limiteValor);
                            if (resultado === null || resultado === void 0 ? void 0 : resultado.sucesso) {
                                yield (0, twilio_1.sendMessage)(To, From, `
\u{1F4B7} Meta cadastrado com sucesso! 
*Meta:* ${newDescricao.trim()}
*Valor Objetivo:* ${(0, formata_dinheiro_1.formatWithRegex)(ValorObjetivo)}
*Valor Atual:* ${(0, formata_dinheiro_1.formatWithRegex)(ValorAtual)}
*Data Limite:*  ${limiteValor}\n
\u{1F4A1}Para cadastrar outra meta digite *5* ou para voltar digite *8* e para sair digite *9*`);
                                yield (0, states_1.limparEstado)(From);
                                globalState.setClientCondition("inicial");
                            }
                            else {
                                yield (0, states_1.limparEstado)(From);
                                globalState.setClientCondition("inicial");
                                yield (0, twilio_1.sendMessage)(To, From, "\u{274C}Houve um erro ao cadastrar o meta. Por favor, tente novamente.");
                            }
                        }
                        catch (error) {
                            yield (0, states_1.limparEstado)(From);
                            globalState.setClientCondition("inicial");
                            yield (0, twilio_1.sendMessage)(To, From, "\u{274C}Houve um erro ao cadastrar o meta. Por favor, tente novamente.");
                        }
                    }
                }
                else if (Body.toUpperCase() === 'N' || Body.trim() === 'Não') {
                    yield (0, twilio_1.sendMessage)(To, From, "\u{274C}Cadastro de meta cancelado. Você pode tentar novamente.");
                    yield (0, states_1.atualizarEstado)(From, "aguardando_dados");
                }
                else {
                    yield (0, twilio_1.sendMessage)(To, From, "\u{26A0}Não reconheci sua resposta. Por favor, responda com *Sim* ou *Não*");
                }
            }
        });
    }
}
exports.Meta = Meta;
