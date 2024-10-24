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
    private prompt = 'crie um array a partir do texto sempres no formato: [<nome da despesa>, <valor>, <data da despesa(YYYY-MM-DD)>, <parcelado(S/N)>]';
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