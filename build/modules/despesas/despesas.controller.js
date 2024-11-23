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
exports.Despesas = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const twilio_1 = require("../../infra/integrations/twilio");
const formata_dinheiro_1 = require("../../utils/formata-dinheiro");
require("../../commands");
const trata_telefone_1 = require("../../utils/trata-telefone");
const despesas_repository_1 = require("./despesas.repository");
const validation_1 = require("../../utils/validation");
const clientes_repository_1 = require("../clientes/clientes.repository");
const states_1 = require("../../infra/states/states");
const transcribe_controler_1 = require("../transcribe/transcribe.controler");
const summarize_service_1 = require("../../infra/integrations/summarize.service");
const dayjs_1 = __importDefault(require("dayjs"));
const global_state_1 = require("../../infra/states/global-state");
class Despesas {
    constructor() {
        this.whatsapp = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const summarizeServiceDespesas = new summarize_service_1.SummarizeServiceDespesas();
            const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
            const globalState = global_state_1.GlobalState.getInstance();
            const condicao = globalState.getClientCondition();
            const cliente_id = yield (0, clientes_repository_1.criarClientePorTelefone)((0, trata_telefone_1.formatarNumeroTelefone)(From.replace(/^whatsapp:/, '')));
            if (condicao == "despesas") {
                yield (0, states_1.atualizarEstado)(From, "aguardando_dados");
            }
            const cliente = (0, states_1.verificarClienteEstado)(cliente_id);
            const estadoAtual = yield (0, states_1.verificarEstado)(From);
            if ((estadoAtual == 'aguardando_continuacao' && Body == 'N') || (estadoAtual == 'aguardando_continuacao' && Body == 'n')) {
                globalState.setClientCondition("inicial");
                yield (0, twilio_1.sendMessage)(To, From, "\u{1F44D}Digite *8* para ver o menu");
            }
            if ((estadoAtual == 'aguardando_continuacao' && Body == 'S') || (estadoAtual == 'aguardando_continuacao' && Body == 's')) {
                yield (0, twilio_1.sendMessage)(To, From, `\u{1F44D} Para cadastrar uma despesa, digite ou fale os detalhes: 
*Nome da despesa*
*data* 
*Valor*
*Método de pagamento* (Crédito parcelado, Crédito a vista, Débito, PIX)
`);
                yield (0, states_1.atualizarEstado)(From, "aguardando_dados");
            }
            if (estadoAtual == 'aguardando_continuacao'
                && Body != 'N'
                && Body != 'n'
                && Body != 'S'
                && Body != 's') {
                yield (0, twilio_1.sendMessage)(To, From, "\u{26A0}Não reconheci seu comando,Para cadastrar outra despesa digite 'S' ou voltar digite 'N'.");
            }
            if (!estadoAtual) {
                yield (0, twilio_1.sendMessage)(To, From, `\u{1F44D} Para cadastrar uma despesa, digite ou fale os detalhes: 
*Nome da despesa*
*data* 
*Valor*
*Método de pagamento* (Crédito parcelado, Crédito a vista, Débito, PIX)
`);
                yield (0, states_1.atualizarEstado)(From, "aguardando_dados");
            }
            if (estadoAtual === "aguardando_dados") {
                const Transcribe = yield (0, transcribe_controler_1.transcribe)(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
                if (!Transcribe)
                    return;
                const response = yield summarizeServiceDespesas.summarize(Transcribe);
                console.log(">>>>>>summerize", response);
                let [descricao, valorStr, dataStr, categoria, metodo_pagamento] = response.split(',');
                let dataString = (0, dayjs_1.default)(dataStr).format('YYYY-MM-DD');
                if (dataString === 'Invalid Date') {
                    dataString = (0, dayjs_1.default)().format('YYYY-MM-DD');
                }
                console.log(">>>>>>tese", descricao, valorStr, dataStr, categoria, metodo_pagamento);
                const valor = parseFloat(valorStr);
                if (!cliente) {
                    return undefined;
                }
                globalState.setMensagem(`${response}`);
                try {
                    const newDescricao = descricao.replace(/["'\[\]\(\)]/g, '');
                    const newCategoria = categoria.replace(/["'\[\]\(\)]/g, '');
                    const newMetodo = metodo_pagamento.replace(/["'\[\]\(\)]/g, '');
                    console.log(">>>>>>tese", newDescricao, newCategoria, newMetodo);
                    if (!(0, validation_1.validarDescricao)(descricao) || !(0, validation_1.validarValor)(valor) || !(0, validation_1.validarData)(dataString) || newDescricao == null) {
                        console.log(">>>>>>errrooo", newDescricao, newCategoria, newMetodo);
                        yield (0, twilio_1.sendMessage)(To, From, "\u{26A0} Desculpe não entendi, forneça os dados corretos da despesa. Muita atenção ao VALOR, Você pode digitar ou falar");
                    }
                    else {
                        console.log(">>>>>>acerto", newDescricao, newCategoria, newMetodo);
                        globalState.setClientCondition("despesas_1");
                        const dadosMsg = ` \u{1F4B8}Despesa: *${newDescricao.trim()}*, *Valor:${(0, formata_dinheiro_1.formatWithRegex)(valor)}*, *Data:${(0, dayjs_1.default)(dataString).format('DD-MM-YYYY')}* , ${newCategoria}, ${newMetodo}`;
                        yield (0, states_1.atualizarEstado)(From, "aguardando_confirmacao_dados");
                        (0, twilio_1.sendConfirmPadraoMessage)(To, From, dadosMsg);
                    }
                }
                catch (error) {
                    yield (0, twilio_1.sendMessage)(To, From, "\u{274C} AHouve um erro ao cadastrar a despesa. Por favor, tente novamente.");
                }
            }
            if (estadoAtual === 'aguardando_confirmacao_dados') {
                let dados = globalState.getMensagem();
                if (!dados)
                    return null;
                let [descricao, valorStr, dataStr, categoria, metodo_pagamento] = dados.split(',');
                console.log(">>>>>>", descricao, valorStr, dataStr, categoria, metodo_pagamento);
                if (Body.toUpperCase() === 'S' || Body.trim() === 'Sim') {
                    if (cliente) {
                        try {
                            let dataString = (0, dayjs_1.default)(dataStr).format('YYYY-MM-DD');
                            if (dataString == 'Invalid Date') {
                                dataString = (0, dayjs_1.default)().format('YYYY-MM-DD');
                            }
                            const newDescricao = descricao.replace(/["'\[\]\(\)]/g, '');
                            const newCategoria = categoria.replace(/["'\[\]\(\)]/g, '');
                            const newMetodo = metodo_pagamento.replace(/["'\[\]\(\)]/g, '');
                            const valor = parseFloat(valorStr);
                            const resultado = yield (0, despesas_repository_1.cadastrarDespesa)(cliente, newDescricao, valor, dataString, newCategoria, newMetodo);
                            yield (0, twilio_1.sendMessage)(To, From, `
*Despesa cadastrada com sucesso!* 
\u{1F4B8} *Despesa:* ${newDescricao.trim()}
\u{1F4B4} *Valor:* ${(0, formata_dinheiro_1.formatWithRegex)(valor)} 
\u{231A} *Data:* ${(0, dayjs_1.default)(dataString).format('DD-MM-YYYY')},
\u{1F4C4} *Categoria:* ${newCategoria.trim()},
\u{1F5F3} *Método de pagamento:* ${newMetodo.trim()} \n
\u{1F4A1}Para cadastrar nova despesa digite *1* \n para voltar ao menu digite *8* \n e para sair digite *9*`);
                            yield (0, states_1.limparEstado)(From);
                            globalState.setClientCondition("inicial");
                        }
                        catch (error) {
                            yield (0, states_1.limparEstado)(From);
                            globalState.setClientCondition("inicial");
                            yield (0, twilio_1.sendMessage)(To, From, "\u{274C} BHouve um erro ao cadastrar a despesa. Por favor, tente novamente.");
                        }
                    }
                }
                else if (Body.toUpperCase() === 'N' || Body.trim() === 'Não') {
                    yield (0, twilio_1.sendMessage)(To, From, "\u{26A0} Sem problemas. Você pode enviar os dados novamente.");
                    yield (0, states_1.atualizarEstado)(From, "aguardando_dados");
                }
                else {
                    yield (0, states_1.atualizarEstado)(From, "aguardando_dados");
                    yield (0, twilio_1.sendMessage)(To, From, "\u{274C} Não reconheci sua resposta. Por favor, responda com 'Sim' para sim ou 'Não' para não.");
                }
            }
        });
    }
}
exports.Despesas = Despesas;
