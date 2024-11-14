"use strict";
//esse index para bot simples co commander
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
const twilio_1 = require("./infra/integrations/twilio");
require("./commands");
const commandManager_1 = require("./commandManager");
const clienteService_1 = require("./clienteService");
const app = (0, express_1.default)();
const port = 3000;
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.post('/whatsapp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { From, To, Body } = req.body;
    const [commandName, ...args] = Body.split(' ');
    console.log("req...........", req.body);
    //Verificar se o cliente já está cadastrado
    const clienteCadastrado = yield (0, clienteService_1.verificarClientePorTelefone)(From);
    if (!clienteCadastrado) {
        (0, twilio_1.sendMessage)(To, From, '\u{1F63A} Olá, não encontramos seu cadastro. Por favor, registre-se antes de continuar.');
        return res.send("Cliente não cadastrado");
    }
    // Processar o comando
    const command = (0, commandManager_1.getCommand)(commandName);
    if (command) {
        const response = command.execute(args);
        (0, twilio_1.sendMessage)(To, From, response);
    }
    else {
        (0, twilio_1.sendMessage)(To, From, '\u{1F63A} Olá, não entendiaaaaa. Comando não reconhecido. \u{2600} \n \u{1F3C4} Digite "8" para lista de opções. \n \u{1F525} Digite "9" para sair.');
    }
    res.send("Mensagem recebida!");
}));
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
