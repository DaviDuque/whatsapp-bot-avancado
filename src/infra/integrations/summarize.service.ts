import OpenAI from "openai";
import SummarizeServiceInterface from "../../domain/service/summarize.service.interface";

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
    onde "Dspesa" seja do tipo string, "valor" seja float: 10,00, 
    "data da despesa" seja date:YYYY-MM-DD, "categoria" seja string, 
    e "parcelado" seja char(1). caso os dados "data da despesa" e "valor"  
    não seja identificado retorne null para cada um deles em sua devida posição no array. "Despesa" representa algo comprado, adiquirido ou utilizado. caso "parcelado" 
    não seja identificado no texto, retorne o default "N". 
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