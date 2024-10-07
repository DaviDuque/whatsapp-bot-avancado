import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import os from "os";
import AudioServiceInterface from "../../domain/service/audio.service.interface";
import axios from "axios";
import { promisify } from "util";
import Ffmpeg from "fluent-ffmpeg";

const writeFileAsync = promisify(fs.writeFile);

const accountSid = process.env.TWILIO_ACCOUNT_SID || ' ';
const apiKeySecret = process.env.TWILIO_AUTH_TOKEN || ' ';

export class AudioService implements AudioServiceInterface {
   private oggFilePath: string; 
   private oggFileName: string; 
   private mp3FilePath: string; 
   private mp3FileName: string; 
   private audioLoaded: boolean = false; 
    
   constructor() {
    const name = uuidv4();
    this.oggFileName = `${name}.ogg`;
    this.mp3FileName = `${name}.mp3`;

    this.oggFilePath = path.join(os.tmpdir(), this.oggFileName);
    this.mp3FilePath = path.join(os.tmpdir(), this.mp3FileName);
   }
   
    async download(url: string): Promise<string> {

        console.log(">>>>>>>>>>>>>>>>>>URL", url)
        const response =  await axios.get(url, {responseType: 'arraybuffer', auth: {
            username: accountSid,
            password: apiKeySecret,
          }});

        const audioBuffer = Buffer.from(response.data);
        await writeFileAsync(this.oggFilePath, audioBuffer);
        this.audioLoaded = true;

        console.log("errrrr -->", response.data);

        if(!this.audioLoaded) {
            throw new Error('>>>>>>>>>>>>>Audio not loaded')
        }
        
        console.log(">>>>>>>>>>>>>>>>ponto 2", this.oggFilePath);
        return new Promise((resolve, reject) => {
            Ffmpeg(this.oggFilePath)
            .output(this.mp3FilePath)
            .on('end', ()=> {
                resolve(this.mp3FilePath);
            })
            .on('error', (err) => {
                reject(err);
            })
            .run();
        });
    }


    /*async download2(url: string): Promise<string> {
     // try {
        // Busca os detalhes da mídia
        //const mediaUrl = url;
    
        // Autenticando a requisição com o axios
        const response = await axios({
          url: url,
          method: 'GET',
          responseType: 'arraybuffer', // Recebe o conteúdo em formato de stream (para áudio)
          auth: {
            username: accountSid,
            password: apiKeySecret,
          }
        });
    
        const audioBuffer = Buffer.from(response.data);
       
        await writeFileAsync(this.oggFilePath, audioBuffer);
        this.audioLoaded = true;
    
        if(!this.audioLoaded) {
            throw new Error('>>>>>>>>>>>>>Audio not loaded')
        }
        
        console.log(">>>>>>>>>>>>>>>>ponto 2", this.oggFilePath);
        return new Promise((resolve, reject) => {
            Ffmpeg(this.oggFilePath)
            .output(this.mp3FilePath)
            .on('end', ()=> {
                resolve(this.mp3FilePath);
            })
            .on('error', (err) => {
                reject(err);
            })
            .run();
    });

  /*} catch (error) {
    console.error('Erro ao buscar o áudio:', error);
  }*/

//}


}
