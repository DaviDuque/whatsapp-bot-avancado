"use strict";
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
exports.SummarizeServiceRelatorio = exports.SummarizeServiceMeta = exports.SummarizeServiceConta = exports.SummarizeServiceCartao = exports.SummarizeServiceInvestimentos = exports.SummarizeServiceReceitas = exports.SummarizeServiceDespesas = exports.SummarizeService = void 0;
const openai_1 = __importDefault(require("openai"));
const despesas_1 = require("../memory/prompts/despesas");
const receitas_1 = require("../memory/prompts/receitas");
const contas_1 = require("../memory/prompts/contas");
const dataAtual = new Date();
const dia = dataAtual.getDate(); // Dia do mês
const mes = dataAtual.getMonth() + 1; // Mês (0-11, então adicionamos 1)
const ano = dataAtual.getFullYear(); // Ano completo
const dataCompleta = `${ano}-${mes}-${dia}`;
class SummarizeService {
    constructor() {
        this.temperature = 0.7;
        this.prompt = 'Summarize';
        this.model = 'gpt-3.5-turbo';
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    summarize(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.openai.chat.completions.create({
                messages: [{ role: 'user', content: `${this.prompt} ${text}` }],
                model: this.model,
                temperature: this.temperature,
            });
            if (!response.choices[0].message.content) {
                throw new Error('Não foi possível resumir o texto');
            }
            return response.choices[0].message.content;
        });
    }
}
exports.SummarizeService = SummarizeService;
class SummarizeServiceDespesas {
    constructor() {
        this.temperature = 0.7;
        this.prompt = despesas_1.despesas;
        this.model = 'gpt-3.5-turbo';
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    summarize(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.openai.chat.completions.create({
                messages: [{ role: 'user', content: `${this.prompt} ${text}` }],
                model: this.model,
                temperature: this.temperature,
            });
            if (!response.choices[0].message.content) {
                throw new Error('Não foi possível resumir o texto');
            }
            return response.choices[0].message.content;
        });
    }
}
exports.SummarizeServiceDespesas = SummarizeServiceDespesas;
class SummarizeServiceReceitas {
    constructor() {
        this.temperature = 0.7;
        this.prompt = receitas_1.receitas;
        this.model = 'gpt-3.5-turbo';
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    summarize(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.openai.chat.completions.create({
                messages: [{ role: 'user', content: `${this.prompt} ${text}` }],
                model: this.model,
                temperature: this.temperature,
            });
            if (!response.choices[0].message.content) {
                throw new Error('Não foi possível resumir o texto');
            }
            return response.choices[0].message.content;
        });
    }
}
exports.SummarizeServiceReceitas = SummarizeServiceReceitas;
class SummarizeServiceInvestimentos {
    constructor() {
        this.temperature = 0.7;
        this.prompt = contas_1.contas;
        this.model = 'gpt-3.5-turbo';
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    summarize(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.openai.chat.completions.create({
                messages: [{ role: 'user', content: `${this.prompt} ${text}` }],
                model: this.model,
                temperature: this.temperature,
            });
            if (!response.choices[0].message.content) {
                throw new Error('Não foi possível resumir o texto');
            }
            return response.choices[0].message.content;
        });
    }
}
exports.SummarizeServiceInvestimentos = SummarizeServiceInvestimentos;
class SummarizeServiceCartao {
    constructor() {
        this.temperature = 0.7;
        this.prompt = `Recebendo os dados de entrada em diversos formatos, podendo ser texto simples, nomes de variáveis e informações exatas, extraia um array a partir do texto fornecido sempre no formato: [<cartão>, <tipo>, <banco>, <limite_total> <limite_disponivel>]'. As informções podem vir fora de ordem ou ordenado. Caso venham desordenadas, ordene conforme [<cartão>, <tipo>, <banco>, <limite> <saldo>].
    
    Os atributos tem as seguinte caracteristicas de saída:
    -cartão: Representa o nome de um cartao bancário e deve ser do tipo string.
    -tipo: deve ser do tipo string e necessariamente deve estar em uma categoria no qual encaixe em uma das o pções, sendo "N/A" quando não identificado. Opções["Cartão de Crédito", "Cartão de débito", "Cartão Pré Pago", "N/A"].
    -banco: deve ser do tipo string.
    -limite total:deve ser do tipo float: 10.00.
    -limite disponível:deve do tipo float: 10.00.
    
Os dados podem vir desestruturados e fora de ordem. Retorne apenas o array e ordenado conforme exemplo.
     Texto: `;
        this.model = 'gpt-3.5-turbo';
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    summarize(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.openai.chat.completions.create({
                messages: [{ role: 'user', content: `${this.prompt} ${text}` }],
                model: this.model,
                temperature: this.temperature,
            });
            if (!response.choices[0].message.content) {
                throw new Error('Não foi possível resumir o texto');
            }
            return response.choices[0].message.content;
        });
    }
}
exports.SummarizeServiceCartao = SummarizeServiceCartao;
class SummarizeServiceConta {
    constructor() {
        this.temperature = 0.7;
        this.prompt = `extrair um array a partir do texto fornecido sempre no formato: 
    [<conta>, <tipo>, <banco>, <limite> <saldo>]', 
    onde "cartão" seja do tipo string, "tipo" seja tipo string, "banco" seja do tipo string, "limite" seja do tipo float: 10,00,  "saldo" seja do tipo float: 10,00.
    caso os dados 
    não sejam identificados retorne null para cada um deles em sua devida posição no array. "conta" representa o nome de uma conta bancario. 
    Para "tipo" localize em qual das o pções melhor se encaixa, sendo "N/A" quando não identificado.
    opções["Poupança", "Conta corrente", "N/A"]. 
Os dados podem vir desestruturados e fora de ordem. Retorne apenas o array e ordenado conforme exemplo.
     Texto: `;
        this.model = 'gpt-3.5-turbo';
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    summarize(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.openai.chat.completions.create({
                messages: [{ role: 'user', content: `${this.prompt} ${text}` }],
                model: this.model,
                temperature: this.temperature,
            });
            if (!response.choices[0].message.content) {
                throw new Error('Não foi possível resumir o texto');
            }
            return response.choices[0].message.content;
        });
    }
}
exports.SummarizeServiceConta = SummarizeServiceConta;
class SummarizeServiceMeta {
    constructor() {
        this.temperature = 0.7;
        this.prompt = `considere o texto enviado para extrair um array a partir do texto fornecido sempre no formato: 
    [<meta/entrada>, <valor Objetivo>, <valor atual>,  <data limite>]', 
    onde "meta" seja do tipo string, "valor atual" seja tipo float: 10,00, "valor objetivo" seja tipo float: 10,00,
    "data limite" seja tipo date:YYYY-MM-DD. os dados podem vir em formatos diferentes, coloque no formato correto. caso os dados  
    não sejam identificados retorne null para cada um deles que não for identificado em sua devida posição no array. "meta" representa capital o nome do dinheiro que a pessoa quer juntar. 
     Os dados podem vir desestruturados e fora de ordem. Retorne apenas o array e ordenado conforme exemplo.
     Texto: `;
        this.model = 'gpt-3.5-turbo';
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    summarize(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.openai.chat.completions.create({
                messages: [{ role: 'user', content: `${this.prompt} ${text}` }],
                model: this.model,
                temperature: this.temperature,
            });
            if (!response.choices[0].message.content) {
                throw new Error('Não foi possível resumir o texto');
            }
            return response.choices[0].message.content;
        });
    }
}
exports.SummarizeServiceMeta = SummarizeServiceMeta;
class SummarizeServiceRelatorio {
    constructor() {
        this.temperature = 0.7;
        this.prompt = `considere o texto enviado para extrair um array a partir do texto fornecido sempre no formato: 
    [<data inicial>, <data final>]', 
    onde:
    "data inicial" seja a data mais antiga e do tipo date:YYYY-MM-DD e data final" seja a menos antiga e do tipo date:YYYY-MM-DD.  e se data inicial for "hoje" ou "atual" retorne ${dataCompleta},
     caso data final ou data inicial seja em outro formato como tempo corrido, realize o cálculo, exemplo: se data inicial é hoje, logo é ${dataCompleta}, 
     se data final é daqui um mês, logo data final é ${dataCompleta} + 1 mês ou mais 30 dias (se for 21 de dezembro, sera 21 de janeiro). 
     Os dados podem vir em formatos diferentes, coloque no formato correto(date:YYYY-MM-DD). caso os dados  
    não sejam identificados retorne null para cada um deles que não for identificado em sua devida posição no array.
     Os dados podem vir desestruturados e fora de ordem. Retorne apenas o array e ordenado com data menor na primeira posição e data maior na segunda posição.
     Texto: `;
        this.model = 'gpt-3.5-turbo';
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    summarize(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.openai.chat.completions.create({
                messages: [{ role: 'user', content: `${this.prompt} ${text}` }],
                model: this.model,
                temperature: this.temperature,
            });
            if (!response.choices[0].message.content) {
                throw new Error('Não foi possível resumir o texto');
            }
            return response.choices[0].message.content;
        });
    }
}
exports.SummarizeServiceRelatorio = SummarizeServiceRelatorio;
