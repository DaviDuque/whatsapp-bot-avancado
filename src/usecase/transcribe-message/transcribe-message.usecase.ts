import { Message } from "../../domain/entities/message";
import { MessageRepositoryInterface } from "../../domain/repository/message-repository.interface";
import AudioServiceInterface from "../../domain/service/audio.service.interface";
import SummarizeServiceInterface from "../../domain/service/summarize.service.interface";
import TranscriptionServiceInterface from "../../domain/service/transcription.service.interface";
import { MessageDTO } from "./message.dto";

export class TranscribeMessageUseCase {
    constructor(
        private transcriptionService: TranscriptionServiceInterface,
        private audioService: AudioServiceInterface,
        private summarizationService: SummarizeServiceInterface,
        private messageRepository: MessageRepositoryInterface,
    ){}

    async execute(messageData: MessageDTO): Promise<string | undefined> {
        const newMessage = new Message(
            messageData.smsMessageSid,
            messageData.mediaContentType0,
            messageData.numMedia,
            messageData.profileName,
            messageData.waId,
            messageData.body,
            messageData.to,
            messageData.from,
            messageData.mediaUrl0,
            messageData.transcribeText
        );

        
        if(!newMessage.isMediaMessage()){
            console.log('Mensagem não tem midia!');
            return undefined;
        }

        console.log(">>>>>>>>>>>>>>>>>memory 2", newMessage);

        this.messageRepository.add(newMessage);
        console.log(">>>>>>>>>>>>>>>>>memory 3");

        const mp3Path = await this.audioService.download(newMessage.mediaUrl0);
        console.log(">>>>>>>>>>>>>>>>>memory 4");
        const transcription = await this.transcriptionService.transcribe(mp3Path);
        console.log(">>>>>>>>>>>>>>>>>memory 5");

        if (transcription.length > 10) {
            const summarizedTranscription = await this.summarizationService.summarize(transcription);
            newMessage.setTranscriptionText(summarizedTranscription);
            //this.messageRepository.update(newMessage.smsMessageSid, newMessage);
            return summarizedTranscription;
        }
        newMessage.setTranscriptionText(transcription);
        //this.messageRepository.update(newMessage.smsMessageSid, newMessage);

        return  transcription;

    }
}

