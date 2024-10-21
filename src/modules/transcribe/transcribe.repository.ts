import { MessageAudio } from "../../domain/entities/message-audio";
import { MessageAudioRepositoryInterface } from "../../domain/repository/message-repository.interface";
import AudioServiceInterface from "../../domain/service/audio.service.interface";
import TranscriptionServiceInterface from "../../domain/service/transcription.service.interface";
import { MessageDTO } from "./message.dto";

export class TranscribeMessageController {
    constructor(
        private transcriptionService: TranscriptionServiceInterface,
        private audioService: AudioServiceInterface,
        private messageRepository: MessageAudioRepositoryInterface,
    ){}

    async execute(messageData: MessageDTO): Promise<string | undefined> {
        const newMessage = new MessageAudio(
            messageData.smsMessageSid,
            messageData.mediaContentType0,
            messageData.numMedia,
            messageData.mediaUrl0
        );

        
        if(!newMessage.isMediaMessage()){
            console.log('Mensagem não tem midia!');
            return undefined;
        }

        console.log(">>>>>>>>>>>>>>>>>memory 2", newMessage);

        this.messageRepository.add(newMessage);
        console.log(">>>>>>>>>>>>>>>>>memory 3");

        if (!newMessage.mediaUrl0) {
            console.log('A URL de mídia não está disponível!');
            return undefined;
        }

        const mp3Path = await this.audioService.download(newMessage.mediaUrl0);
        console.log(">>>>>>>>>>>>>>>>>memory 4");
        const transcription = await this.transcriptionService.transcribe(mp3Path);
        console.log(">>>>>>>>>>>>>>>>>memory 5", transcription);
        
        if (!transcription) {
            return undefined;
        }
    
        return  transcription;

    }
}

