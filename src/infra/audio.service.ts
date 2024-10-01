import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import os from "os";
import axios from "axios";
import AudioServiceInterface from "../domain/service/audio.service.interface";
import { promisify } from "util";
import Ffmpeg from "fluent-ffmpeg";

const writeFileSync = promisify(fs.writeFile);

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
   
    async download(url:string): Promise<string> {
        const response =  await axios.get(url, {responseType: 'arraybuffer'});
        const audioBuffer = Buffer.from(response.data);
        await writeFileSync(this.oggFilePath, audioBuffer);
        this.audioLoaded = true;

        if(!this.audioLoaded) {
            throw new Error('Audio not loaded')
        }
        
        return new Promise((resolve, reject) => {
            Ffmpeg(this.oggFileName)
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
}