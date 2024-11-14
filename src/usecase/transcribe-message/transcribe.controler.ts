import * as dotenv from 'dotenv';
dotenv.config();
import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import { sendMessage } from '../../infra/integrations/twilio';
import './commands';
import { getCommand } from "../../commandManager";
import { AudioService } from '../../infra/integrations/audio.service';
import { TranscriptionService } from '../../infra/integrations/transcription.service';
import { SummarizeService } from '../../infra/integrations/summarize.service';
import { TranscribeMessageUseCase } from '../../usecase/transcribe-message/transcribe-message.usecase';
import { TranscribeMessageController } from '../../modules/transcribe/transcribe.repository';
import { MessageMemoryRepository } from '../../infra/memory/message-memory.repository';
//import { MessageTextMemoryRepository } from '../../infra/memory/message-text-memory.repository';
import { SummarizeMessageUseCase } from '../../usecase/message-text/summerize-message.usecase';
import { Auth } from '../../infra/auth/auth';
import { authMiddleware } from '../../infra/auth/auth.middleware';






export class Transcribe {


whatsapp = async(req: Request, res: Response) => {

    const { SmsMessageSid, MediaContentType0, NumMedia, ProfileName, WaId, Body, To, From, MediaUrl0, TranscribeText }  = req.body;
    

    if(NumMedia =='1' && MediaContentType0 == 'audio/ogg' && MediaUrl0.length !== 0){
        console.log(">>>midia>>>", req.body);
        const transcriptionService = new TranscriptionService();
        const audioService = new AudioService();
        const messageRepository = new MessageMemoryRepository();

        const transcribeMessageController = new TranscribeMessageController(
            transcriptionService,
            audioService,
            messageRepository
        );

        const response = await transcribeMessageController.execute({
           smsMessageSid: SmsMessageSid,
           mediaContentType0: MediaContentType0,
           numMedia: NumMedia,       
           profileName: ProfileName,
           waId: WaId,
           body: Body,
           to: To,
           from: From,
           mediaUrl0: MediaUrl0,
           transcribeText: TranscribeText
        });
        
        if (!response) {
            sendMessage(To, From, 'Não foi possível transcrever a msg');
            return;
        }

        //sendMessage(To, From, response);
        console.log(To, From, response);
        return;
    }
    


    const [commandName, ...args] = Body.split(' ');
    const command = getCommand(commandName);

    if(command){
        const response = command.execute(args);
        sendMessage(To, From, response); 
    }else{
        sendMessage(To, From, 'OPS! não identificamos a msg. \n Envie "help" para lista de comandos');
    }
};


}