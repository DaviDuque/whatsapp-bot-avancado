import { MessageText } from "../../domain/entities/message-text";
import { MessageTextRepositoryInterface } from "../../domain/repository/message-text-repository.interface";
import SummarizeServiceInterface from "../../domain/service/summarize.service.interface";
import { MessageTextDTO } from "./message-text.dto";

export class SummarizeMessageUseCase {
    constructor(
        private summarizationService: SummarizeServiceInterface,
        private messageRepository: MessageTextRepositoryInterface,
    ){}

    async execute(messageData: MessageTextDTO): Promise<string | undefined> {
        const newMessageText = new MessageText(
            messageData.smsMessageSid,
            messageData.mediaContentType0, 
            messageData.numMedia, 
            messageData.profileName, 
            messageData.waId,
            messageData.body,
            messageData.to,
            messageData.from,
            messageData.mediaUrl0,
        );

        if(!newMessageText.body){
            console.log('Mensagem não identificada!');
            return undefined;
        }
    
       
        console.log("summerize-message-usecase>>>>>>>>>>>>>>>>>requisição recebida", newMessageText.body);

        this.messageRepository.add(newMessageText);
        console.log("summerize-message-usecase>>>>>>>>>>>>>>>>>adicionada a memoria");

        
        
       if (newMessageText.body.length > 10) {
            const summarizedText = await this.summarizationService.summarize(newMessageText.body);
            this.messageRepository.update(newMessageText.smsMessageSid, newMessageText);
            return summarizedText;
        }
        

        return newMessageText.body;
    }
}

