import { Message } from "../../domain/entities/message";
import { MessageRepositoryInterface } from "../../domain/repository/message-repository.interface";
import { SummarizeService } from '../../infra/integrations/summarize.service';
import { MessageDTO } from "../../DTO/message.dto";

export class SummarizeController {
    constructor(
        private summarizationService: SummarizeService,
        private messageRepository: MessageRepositoryInterface,
    ){}

    async execute(messageData: MessageDTO): Promise<string | undefined> {
        const newMessage = new Message(
            messageData.body
        );

        
        if(!newMessage.smsMessageSid){
            console.log('Mensagem não recebida!');
            return undefined;
        }
        if(!newMessage.body){
            console.log('Mensagem sem corpo!');
            return undefined;
        }

        this.messageRepository.add(newMessage);

            const summarizeTranscription = await this.summarizationService.summarize(newMessage.body);
            newMessage.setTranscriptionText(summarizeTranscription);
            this.messageRepository.update(newMessage.smsMessageSid, newMessage);
            return summarizeTranscription;
        


    }
}
