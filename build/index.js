"use strict";
//index para cadastro
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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const auth_1 = require("./infra/auth/auth");
const auth_middleware_1 = require("./infra/auth/auth.middleware");
const clientes_controller_1 = require("./modules/clientes/clientes.controller");
const relatorio_clientes_controller_1 = require("./modules/clientes/relatorio-clientes.controller");
const despesas_controller_1 = require("./modules/despesas/despesas.controller");
const receitas_controller_1 = require("./modules/receitas/receitas.controller");
const investimentos_controller_1 = require("./modules/investimentos/investimentos.controller");
const cartao_controller_1 = require("./modules/cartao/cartao.controller");
const conta_controller_1 = require("./modules/conta/conta.controller");
const clientes_repository_1 = require("./modules/clientes/clientes.repository");
const audio_service_1 = require("./infra/integrations/audio.service");
const summarize_service_1 = require("./infra/integrations/summarize.service");
const global_state_1 = require("./infra/states/global-state");
const commandManager_1 = require("./commandManager");
const twilio_1 = require("./infra/integrations/twilio");
const extrair_relatorios_controller_1 = require("./modules/relatorios/extrair-relatorios.controller");
const relatorios_simples_controller_1 = require("./modules/relatorios/relatorios-simples.controller");
const relatorios_total_controller_1 = require("./modules/relatorios/relatorios-total.controller");
const arquivos_controller_1 = require("./modules/arquivos/arquivos.controller");
const metas_controller_1 = require("./modules/metas/metas.controller");
const cors_1 = __importDefault(require("cors"));
const trata_telefone_1 = require("./utils/trata-telefone");
const app = (0, express_1.default)();
const port = process.env.PORT || '3333';
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: '*', // Substitua pelo URL do seu frontend
    methods: 'GET,POST,PUT,DELETE', // Métodos permitidos
    allowedHeaders: 'Content-Type, Authorization' // Cabeçalhos permitidos
}));
// Armazenamento temporário para os dados do cliente em processo de cadastro
const dadosClientesTemporarios = {};
const newCliente = new clientes_controller_1.Clientes();
const newRelatorioClientes = new relatorio_clientes_controller_1.RelatorioClientes;
const newDespesas = new despesas_controller_1.Despesas();
const newReceitas = new receitas_controller_1.Receitas();
const newInvestimentos = new investimentos_controller_1.Investimentos();
const NewCartao = new cartao_controller_1.Cartao();
const NewConta = new conta_controller_1.Conta();
const globalState = global_state_1.GlobalState.getInstance();
const authUsercase = new auth_1.Auth();
const newRelatorio = new extrair_relatorios_controller_1.Relatorios();
const newRelatorioSimples = new relatorios_simples_controller_1.RelatoriosSimples();
const newRelatorioTotal = new relatorios_total_controller_1.RelatoriosTotal();
const newMeta = new metas_controller_1.Meta();
app.get('/', (req, res) => {
    res.send('gelo seco');
});
app.post('/login', authUsercase.login);
app.post('/register', auth_middleware_1.authMiddleware, authUsercase.register);
app.post('/refresh-token', authUsercase.refreshToken);
app.post('/relatorio-simples', newRelatorioSimples.RelatorioSimples);
app.post('/relatorio-total', newRelatorioTotal.RelatorioTotal);
app.get('/relatorio-clientes', newRelatorioClientes.buscar);
app.get('/user/:id_usuario', authUsercase.user);
app.get('/file/:filename', arquivos_controller_1.getFile); // Endpoint para servir o arquivo
app.post('/send-whatsapp', arquivos_controller_1.sendWhatsAppFile);
app.get('/download', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const serviceAudio = new audio_service_1.AudioService();
        const url = process.env.AUDIO_OGG_FILE_PATH;
        if (url == undefined) {
            res.status(400).send('url não informada');
            return;
        }
        const response = yield serviceAudio.download(url);
        res.json({ url: response });
    }
    catch (error) {
        console.log(';;;;', error);
        res.status(500).send(error);
    }
}));
app.post('/whatsapp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { From, To, Body } = req.body;
    console.log("reqbody>>>", Body);
    //if(!Body) return undefined;
    const [commandName, ...args] = Body.split(' ');
    console.log("req...........", req.body);
    // Verificar se o cliente já está cadastrado
    const clienteCadastrado = yield (0, clientes_repository_1.verificarClientePorTelefone)((0, trata_telefone_1.formatarNumeroTelefone)(From.replace(/^whatsapp:/, '')));
    //const clienteCadastrado = true;
    console.log("cliente index...........", clienteCadastrado);
    if (!clienteCadastrado) {
        console.log("cliente index 2...........", clienteCadastrado);
        //await newReceitas.processarMensagemReceita(req, res);
        yield newCliente.whatsapp(req, res);
        //await newDespesas.whatsapp(req, res);
    }
    if (clienteCadastrado) {
        const cliente = globalState.getClientId();
        if (!cliente) {
            console.log("entruuuuuuuuuuu");
            const cliente_id = yield (0, clientes_repository_1.criarClientePorTelefone)((0, trata_telefone_1.formatarNumeroTelefone)(From.replace(/^whatsapp:/, '')));
            globalState.setClientId(cliente_id);
            globalState.setClientCondition("inicial");
            globalState.setMensagem([
                req.body.SmsMessageSid,
                req.body.NumMedia,
                req.body.ProfileName,
                req.body.MessageType,
                req.body.SmsSid,
                req.body.WaId,
                req.body.SmsStatus,
                req.body.Body,
                req.body.To,
                req.body.NumSegments,
                req.body.ReferralNumMedia,
                req.body.MessageSid,
                req.body.AccountSid,
                req.body.From,
                req.body.ApiVersion
            ]);
        }
        const mensagem = globalState.getMensagem();
        console.log(`ID do cliente armazenado: ${globalState.getClientId()}`);
        console.log(`body do cliente armazenado-->: ${globalState.getMensagem()}`);
        console.log(`body do cliente armazenado-->: ${mensagem}`);
        console.log(`cliente condição-->: ${globalState.getClientCondition()}`);
        // Processar o comando
        if (globalState.getClientCondition() == 'inicial') {
            const command = (0, commandManager_1.getCommand)(commandName);
            if (command) {
                console.log("Command>>>>", command);
                console.log("Command>>>>", commandName);
                const response = command.execute(args);
                if (commandName == '8') {
                    yield (0, twilio_1.sendListPickerMessage)(To, From);
                    (0, twilio_1.sendMessage)(To, From, '\u{1F63A} Vamos la!! \u{2600}');
                }
                else {
                    console.log("To>>>>", To);
                    console.log("From>>>>", From);
                    //await sendListPickerMessage(From, To);
                    (0, twilio_1.sendMessage)(To, From, response);
                }
            }
            else {
                yield (0, twilio_1.sendListPickerMessage)(To, From);
                //sendMessage(To, From, '\u{1F63A} Olá, \u{2600} \n \u{1F3C4} Digite "8" para lista de opções. \n \u{1F525} Digite "9" para sair.');
                (0, twilio_1.sendMessage)(To, From, '\u{1F63A} Vamos la!! \u{2600}');
            }
        }
        else if (globalState.getClientCondition() == 'despesas' || globalState.getClientCondition() == 'despesas_2' || globalState.getClientCondition() == 'despesas_1') {
            console.log('-----despesas-----');
            yield newDespesas.whatsapp(req, res);
        }
        else if (globalState.getClientCondition() == 'receitas' || globalState.getClientCondition() == 'receitas_2' || globalState.getClientCondition() == 'receitas_1') {
            console.log('-----receitas-----');
            yield newReceitas.processarMensagemReceita(req, res);
        }
        else if (globalState.getClientCondition() == 'investimentos' || globalState.getClientCondition() == 'investimentos_1' || globalState.getClientCondition() == 'investimentos_2') {
            console.log('-----investimentos-----');
            yield newInvestimentos.processarMensagemInvestimentos(req, res);
        }
        else if (globalState.getClientCondition() == 'relatorio' || globalState.getClientCondition() == 'relatorio_1' || globalState.getClientCondition() == 'relatorio_2') {
            console.log('-----relatorio-----');
            yield newRelatorio.whatsappRelatorio(req, res);
        }
        else if (globalState.getClientCondition() == 'cartao' || globalState.getClientCondition() == 'cartao_1' || globalState.getClientCondition() == 'cartao_2') {
            console.log('-----cartao-----');
            yield NewCartao.whatsappCartao(req, res);
        }
        else if (globalState.getClientCondition() == 'conta' || globalState.getClientCondition() == 'conta_1' || globalState.getClientCondition() == 'conta_2') {
            console.log('-----conta-----');
            yield NewConta.whatsapp(req, res);
        }
        else if (globalState.getClientCondition() == 'meta' || globalState.getClientCondition() == 'meta_1' || globalState.getClientCondition() == 'meta_2') {
            console.log('-----meta-----');
            yield newMeta.whatsappMeta(req, res);
        }
        else {
            globalState.setClientCondition('inicial');
            (0, twilio_1.sendMessage)(To, From, "Desculpe não entendi  mensagem");
        }
    }
    //res.send("Mensagem recebida!");
}));
app.get('/summarize', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const summarizeServiceDespesas = new summarize_service_1.SummarizeServiceDespesas();
        const text = `supermercado, 25,00, 10/10/2024, tsste, n`;
        const response = yield summarizeServiceDespesas.summarize(text);
        res.json({ text: response });
    }
    catch (error) {
        console.log(';;;;', error);
        res.status(500).send(error);
    }
}));
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
