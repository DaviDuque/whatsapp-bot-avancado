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
exports.SummarizeServiceConta = exports.SummarizeServiceCartao = exports.SummarizeServiceInvestimentos = exports.SummarizeServiceReceitas = exports.SummarizeServiceDespesas = exports.SummarizeService = void 0;
const openai_1 = __importDefault(require("openai"));
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
        this.prompt = `extrair um array a partir do texto fornecido sempre no formato: 
    [<Despesa/gasto>, <valor>, <data da despesa>, <categaria>, <parcelado>]', 
    onde "Despesa" seja do tipo string com o nome da despesa(Alimentos, serviços, cursos, etc), "valor" seja float: 10,00, 
    "data da despesa" seja date:YYYY-MM-DD e se data for "hoje" ou "atual" retorne ${dataCompleta}, "categoria" seja string, 
    e "parcelado" seja char(1) sim(s) ou não(n). caso os dados "data da despesa" e "valor"  
    não seja identificado retorne null para cada um deles em sua devida posição no array. "Despesa" representa algo comprado, adiquirido ou utilizado. caso "parcelado" 
    não seja identificado no texto, retorne o default "null". 
    Para "categoria" localize em qual das o pções melhor se encaixa, 
    opções["Mercado", "Veiculos", "Pets", "Contas_residência", "imóveis", "Lazer", "restaurante", "Shopping", "Transporte", "internet", "viajens", "hotéis", "N/A"]. Texto: `;
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
        this.prompt = `extrair um array a partir do texto fornecido sempre no formato: 
    [<receita/entrada>, <valor>, <data>, <categaria>]', 
    onde "receita" seja do tipo string, "valor" seja tipo float: 10,00, 
    "data" seja tipo date:YYYY-MM-DD e se data for "hoje" ou "atual" retorne ${dataCompleta}, "categoria" seja tipo string. caso os dados "data" e "valor"  
    não seja identificado retorne null para cada um deles em sua devida posição no array. "receita" representa capital o dinheiro que entrou na conta ou no bolso, adiquirido. 
    Para "categoria" localize em qual das o pções melhor se encaixa, sendo "N/A" quando não identificado.
    opções["Salário", "Rendimentos", "Ações", "Aluguel", "imóveis", "N/A", "Extra", "Vendas", "Pensão", "Herança", "Previdência"]. Texto: `;
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
        this.prompt = `extrair um array a partir do texto fornecido sempre no formato: 
    [<investimentos/entrada>, <valor>, <data>, <categaria>]', 
    onde "investimentos" seja do tipo string, "valor" seja tipo float: 10,00, 
    "data" seja tipo date:YYYY-MM-DD e se data for "hoje" ou "atual" retorne ${dataCompleta}, "categoria" seja tipo string. caso os dados "data" e "valor"  
    não seja identificado retorne null para cada um deles em sua devida posição no array. "investimento" representa capital o dinheiro que entrou na conta ou no bolso, adiquirido. 
    Para "categoria" localize em qual das o pções melhor se encaixa, sendo "N/A" quando não identificado.
    opções["Títulos", "Criptomoedas", "Ações", "Popança", "imóveis", "N/A", "Debentures", "Previdência"]. Texto: `;
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
        this.prompt = `extrair um array a partir do texto fornecido sempre no formato: 
    [<cartão>, <tipo>, <banco>, <limite> <saldo>]', 
    onde "cartão" seja do tipo string, "tipo" seja tipo string, "banco" seja do tipo string, "limite" seja do tipo float: 10,00,  "saldo" seja do tipo float: 10,00.
    caso os dados 
    não sejam identificados retorne null para cada um deles em sua devida posição no array. "cartão" representa o nome de um cartao bancario. 
    Para "tipo" localize em qual das o pções melhor se encaixa, sendo "N/A" quando não identificado.
    opções["Cartão de Crédito", "Cartão de débito", "Cartão Pré Pago", "N/A"]. Texto: `;
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
    opções["Poupança", "Conta corrente", "N/A"]. Texto: `;
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