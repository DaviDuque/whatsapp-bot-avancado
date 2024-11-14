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
const trata_telefone_1 = require("../../utils/trata-telefone");
const cartao_service_1 = require("./cartao.service");
const validation_1 = require("../../utils/validation");
const clientes_repository_1 = require("../clientes/clientes.repository");
const states_1 = require("../../infra/states/states");
const transcribe_controler_1 = require("../transcribe/transcribe.controler");
const summarize_service_1 = require("../../infra/integrations/summarize.service");
const global_state_1 = require("../../infra/states/global-state");
class Cartao {
    constructor() {
        this.whatsapp = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const summarizeServiceCartao = new summarize_service_1.SummarizeServiceCartao();
            const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
            const globalState = global_state_1.GlobalState.getInstance();
            const mensagem = globalState.getMensagem();
            const condicao = globalState.getClientCondition();
            console.log("variavel global--->", mensagem);
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
                yield (0, twilio_1.sendMessage)(To, From, `Para cadastrar um cartão, digite ou fale os detalhes:
                *Nome da cartão*
                *tipo*
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
                yield (0, twilio_1.sendMessage)(To, From, "Não reconheci seu comando,Para cadastrar outro cartão digite 'S' ou voltar digite 'N'.");
            }
            if (!estadoAtual) {
                yield (0, twilio_1.sendMessage)(To, From, `Para cadastrar um cartão, digite ou fale os detalhes:
*Nome da cartão*
*tipo*
*banco*
*limite*
*saldo*
                     `);
                yield (0, states_1.atualizarEstado)(From, "aguardando_dados");
            }
            if (estadoAtual === "aguardando_dados") {
                const Transcribe = yield (0, transcribe_controler_1.transcribe)(SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0);
                if (!Transcribe)
                    return;
                const response = yield summarizeServiceCartao.summarize(Transcribe);
                console.log("transcribe---->", response);
                let [nome_cartao, tipo, banco, limite, saldo] = response.split(',');
                console.log("testeeeeee", nome_cartao, tipo, banco, limite, saldo);
                //let dataString: string = dayjs(dataStr).format('YYYY-MM-DD');
                //if (dataString === 'Invalid Date') { dataString = dayjs().format('YYYY-MM-DD'); }
                const limiteValor = parseFloat(limite);
                const saldoValor = parseFloat(saldo);
                if (!cliente) {
                    return undefined;
                }
                globalState.setMensagem(`${response}`);
                try {
                    const newNomeCartao = nome_cartao.replace(/["'\[\]\(\)]/g, '');
                    const newTipo = tipo.replace(/["'\[\]\(\)]/g, '');
                    const newBanco = banco.replace(/["'\[\]\(\)]/g, '');
                    if (!(0, validation_1.validarDescricao)(nome_cartao) || !(0, validation_1.validarValorTotal)(limiteValor) || !(0, validation_1.validarValorTotal)(saldoValor) || newNomeCartao == null) {
                        yield (0, twilio_1.sendMessage)(To, From, "Desculpe não entendi, forneça os dados corretos do cartão. Você pode digitar ou falar");
                    }
                    else {
                        globalState.setClientCondition("cartao_1");
                        // Solicitar confirmação dos dados
                        const confirmationMessage = `
Por favor, confirme os dados abaixo:\n
*Cartão:* ${newNomeCartao.trim()}
*tipo:* ${newTipo.trim()}
*Banco:* ${newBanco.trim()}
*Limite:*  ${limiteValor}
*Saldo:* ${saldoValor} \n
É correto? Responda com 'S' para sim ou 'N' para não.`;
                        yield (0, states_1.atualizarEstado)(From, "aguardando_confirmacao_dados");
                        yield (0, twilio_1.sendMessage)(To, From, confirmationMessage);
                    }
                }
                catch (error) {
                    console.log("999999", error);
                    yield (0, twilio_1.sendMessage)(To, From, "Houve um erro ao cadastrar o cartão. Por favor, tente novamente.");
                }
            }
            if (estadoAtual === 'aguardando_confirmacao_dados') {
                let dados = globalState.getMensagem();
                console.log(">>>>>>>>>", dados);
                if (!dados)
                    return null;
                let [nome_cartao, tipo, banco, limite, saldo] = dados.split(',');
                if (Body.toUpperCase() === 'S') {
                    if (cliente) {
                        try {
                            //let dataString: string = dayjs( dataStr!).format('YYYY-MM-DD');
                            //console.log("data formatada 111", dataString);
                            //if (dataString == 'Invalid Date') { dataString = dayjs().format('YYYY-MM-DD') }
                            //console.log("data formatada 2222", dataString);
                            const newNomeCartao = nome_cartao.replace(/["'\[\]\(\)]/g, '');
                            const newTipo = tipo.replace(/["'\[\]\(\)]/g, '');
                            const newBanco = banco.replace(/["'\[\]\(\)]/g, '');
                            const limiteValor = parseFloat(limite);
                            const saldoValor = parseFloat(saldo);
                            console.log(">>>>>>>>>", dados);
                            console.log(">>>>>>>>>", newNomeCartao);
                            console.log(">>>>>>>>>", newTipo);
                            console.log(">>>>>>>>>", newBanco);
                            console.log(">>>>>>>>>", limiteValor);
                            console.log(">>>>>>>>>", saldoValor);
                            const resultado = yield (0, cartao_service_1.cadastrarCartaoController)(cliente, newNomeCartao, newTipo, newBanco, limiteValor, saldoValor);
                            console.log("*****************:", resultado);
                            yield (0, twilio_1.sendMessage)(To, From, `
*Cartão cadastrado com sucesso!* 
*Cartão:* ${newNomeCartao.trim()}
*tipo:* ${newTipo.trim()}
*Banco:* ${newBanco.trim()}
*Limite:*  ${limiteValor}
*Saldo:* ${saldoValor} \n
\u{1F4A1}Para cadastrar outro cartão digite *4* ou voltar digite *8*.`);
                            yield (0, states_1.limparEstado)(From);
                            globalState.setClientCondition("inicial");
                        }
                        catch (error) {
                            yield (0, twilio_1.sendMessage)(To, From, "Houve um erro ao cadastrar o cartão. Por favor, tente novamente.");
                        }
                    }
                }
                else if (Body.toUpperCase() === 'N') {
                    // Se o usuário não confirmar, voltar ao estado anterior
                    yield (0, twilio_1.sendMessage)(To, From, "Cadastro de cartão cancelado. Você pode tentar novamente.");
                    yield (0, states_1.atualizarEstado)(From, "aguardando_dados");
                }
                else {
                    yield (0, twilio_1.sendMessage)(To, From, "Não reconheci sua resposta. Por favor, responda com 'S' para sim ou 'N' para não.");
                }
            }
        });
    }
}
exports.Cartao = Cartao;
