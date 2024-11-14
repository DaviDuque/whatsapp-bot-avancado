import { Message } from "../../domain/entities/message";
//import { MessageTextRepositoryInterface } from "../../domain/repository/message-text-repository.interface";
import SummarizeServiceInterface from "../../domain/service/summarize.service.interface";
import { MessageDTO } from "../../DTO/message.dto";

export class SummarizeMessageUseCase {
    constructor(
        private summarizationService: SummarizeServiceInterface,
        //private messageRepository: MessageTextRepositoryInterface,
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
        );

        if(!newMessage.body){
            console.log('Mensagem não identificada!');
            return undefined;
        }
        if(!newMessage.smsMessageSid){
            return undefined;
        }
    
       
        console.log("summerize-message-usecase>>>>>>>>>>>>>>>>>requisição recebida", newMessage.body);

        //this.messageRepository.add(newMessage);
        console.log("summerize-message-usecase>>>>>>>>>>>>>>>>>adicionada a memoria");

        
        
       if (newMessage.body.length > 10) {
            const summarizedText = await this.summarizationService.summarize(newMessage.body);
           // this.messageRepository.update(newMessage.smsMessageSid, newMessage);
            return summarizedText;
        }
        

        return newMessage.body;
    }
}

