import { Message } from "../../domain/entities/message";

export class MessageMemoryRepository {
    private messages: Message[] = [];

    async add(message:Message): Promise<void>{
        console.log(">>>>>>>>msg repositiry", message);
        this.messages.push(message);
    }

    async update(id: string, updateMessage:Message): Promise<void>{
        const messageIndex = this.messages.findIndex((message) => message.smsMessageSid === id);

        if(messageIndex < 0){
            throw new Error('Messagem não encontrada');
        }
        this.messages[messageIndex] = updateMessage;

    }
}