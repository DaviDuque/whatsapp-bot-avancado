import * as dotenv from 'dotenv';
dotenv.config();
import { AudioService } from '../../infra/integrations/audio.service';
import { TranscriptionService } from '../../infra/integrations/transcription.service';
import { SummarizeService } from '../../infra/integrations/summarize.service';
import { TranscribeMessageController } from './transcribe.repository';
import { MessageMemoryRepository } from '../../infra/memory/message-memory.repository';


    export const transcribe = async(SmsMessageSid: string, NumMedia: string, Body: string, MediaContentType0: string, MediaUrl0: string) => {
      

    if(NumMedia =='1' && MediaContentType0 == 'audio/ogg' && MediaUrl0.length !== 0){
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
           mediaUrl0: MediaUrl0
        });
        
        if (!response) {
            return Body;
        }

        return response;
    }else{
        return Body;
    }
    
};





