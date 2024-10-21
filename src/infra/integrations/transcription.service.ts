import axios, { Axios, AxiosResponse } from "axios";
import TranscriptionServiceInterface from "../../domain/service/transcription.service.interface";
import FormData from "form-data";
import fs from 'fs';

export class TranscriptionService implements TranscriptionServiceInterface {
    private model: string;
    private url: string;
    

    constructor() {
        this.model = 'whisper-1';
        this.url = process.env.URL_OPENAI!;
    }
    
    async transcribe(audioPath:string): Promise<string> {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(audioPath));
        formData.append('model', this.model);

        const response: AxiosResponse = await axios.post(this.url, formData, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY!}`,
                'Content-Type': `multipart/form-data;`,
            },         
        });
        const retorno = Promise.resolve(response.data.text);
        console.log(">>>>>>>>>>>ponto 1 --> ", response.data);
        return  retorno;
    }
}