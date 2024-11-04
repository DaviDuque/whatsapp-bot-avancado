import OpenAI from "openai";
import SummarizeServiceInterface from "../../domain/service/summarize.service.interface";
import { privateDecrypt } from "crypto";

const dataAtual = new Date();
const dia = dataAtual.getDate(); // Dia do mês
const mes = dataAtual.getMonth() + 1; // Mês (0-11, então adicionamos 1)
const ano = dataAtual.getFullYear(); // Ano completo
const dataCompleta = `${ano}-${mes}-${dia}`

export class SummarizeService implements SummarizeServiceInterface {
   

    private temperature = 0.7;
    private prompt = 'Summarize';
    private openai: OpenAI;
    private model = 'gpt-3.5-turbo';

    constructor(){
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async summarize(text:string): Promise<string> {
        const response = await this.openai.chat.completions.create({
            messages: [{ role: 'user', content: `${this.prompt} ${text}`}],
            model: this.model,
            temperature: this.temperature,
        });
        if(!response.choices[0].message.content){
            throw new Error('Não foi possível resumir o texto') ;
        }
        return response.choices[0].message.content;
    }
}



export class SummarizeServiceDespesas implements SummarizeServiceInterface {
    private temperature = 0.7;
    private prompt = `extrair um array a partir do texto fornecido sempre no formato: 
    [<Despesa/gasto>, <valor>, <data da despesa>, <categaria>, <parcelado>]', 
    onde "Despesa" seja do tipo string com o nome da despesa(Alimentos, serviços, cursos, etc), "valor" seja float: 10,00, 
    "data da despesa" seja date:YYYY-MM-DD e se data for "hoje" ou "atual" retorne ${dataCompleta}, "categoria" seja string, 
    e "parcelado" seja char(1) sim(s) ou não(n). caso os dados "data da despesa" e "valor"  
    não seja identificado retorne null para cada um deles em sua devida posição no array. "Despesa" representa algo comprado, adiquirido ou utilizado. caso "parcelado" 
    não seja identificado no texto, retorne o default "null". 
    Para "categoria" localize em qual das o pções melhor se encaixa, 
    opções["Mercado", "Veiculos", "Pets", "Contas_residência", "imóveis", "Lazer", "restaurante", "Shopping", "Transporte", "internet", "viajens", "hotéis", "N/A"]. Texto: `;

    private openai: OpenAI;
    private model = 'gpt-3.5-turbo';

    constructor(){
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async summarize(text:string): Promise<string> {
        const response = await this.openai.chat.completions.create({
            messages: [{ role: 'user', content: `${this.prompt} ${text}`}],
            model: this.model,
            temperature: this.temperature,
        });
        if(!response.choices[0].message.content){
            throw new Error('Não foi possível resumir o texto') ;
        }
        return response.choices[0].message.content;
    }
}



export class SummarizeServiceReceitas implements SummarizeServiceInterface {
    private temperature = 0.7;
    private prompt = `extrair um array a partir do texto fornecido sempre no formato: 
    [<receita/entrada>, <valor>, <data>, <categaria>]', 
    onde "receita" seja do tipo string, "valor" seja tipo float: 10,00, 
    "data" seja tipo date:YYYY-MM-DD e se data for "hoje" ou "atual" retorne ${dataCompleta}, "categoria" seja tipo string. caso os dados "data" e "valor"  
    não seja identificado retorne null para cada um deles em sua devida posição no array. "receita" representa capital o dinheiro que entrou na conta ou no bolso, adiquirido. 
    Para "categoria" localize em qual das o pções melhor se encaixa, sendo "N/A" quando não identificado.
    opções["Salário", "Rendimentos", "Ações", "Aluguel", "imóveis", "N/A", "Extra", "Vendas", "Pensão", "Herança", "Previdência"]. Texto: `;

    private openai: OpenAI;
    private model = 'gpt-3.5-turbo';

    constructor(){
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async summarize(text:string): Promise<string> {
        const response = await this.openai.chat.completions.create({
            messages: [{ role: 'user', content: `${this.prompt} ${text}`}],
            model: this.model,
            temperature: this.temperature,
        });
        if(!response.choices[0].message.content){
            throw new Error('Não foi possível resumir o texto') ;
        }
        return response.choices[0].message.content;
    }
}



export class SummarizeServiceInvestimentos implements SummarizeServiceInterface {
    private temperature = 0.7;
    private prompt = `extrair um array a partir do texto fornecido sempre no formato: 
    [<investimentos/entrada>, <valor>, <data>, <categaria>]', 
    onde "investimentos" seja do tipo string, "valor" seja tipo float: 10,00, 
    "data" seja tipo date:YYYY-MM-DD e se data for "hoje" ou "atual" retorne ${dataCompleta}, "categoria" seja tipo string. caso os dados "data" e "valor"  
    não seja identificado retorne null para cada um deles em sua devida posição no array. "investimento" representa capital o dinheiro que entrou na conta ou no bolso, adiquirido. 
    Para "categoria" localize em qual das o pções melhor se encaixa, sendo "N/A" quando não identificado.
    opções["Títulos", "Criptomoedas", "Ações", "Popança", "imóveis", "N/A", "Debentures", "Previdência"]. Texto: `;

    private openai: OpenAI;
    private model = 'gpt-3.5-turbo';

    constructor(){
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async summarize(text:string): Promise<string> {
        const response = await this.openai.chat.completions.create({
            messages: [{ role: 'user', content: `${this.prompt} ${text}`}],
            model: this.model,
            temperature: this.temperature,
        });
        if(!response.choices[0].message.content){
            throw new Error('Não foi possível resumir o texto') ;
        }
        return response.choices[0].message.content;
    }
}