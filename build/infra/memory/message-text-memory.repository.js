"use strict";
/*import { MessageText } from "../../domain/entities/message-text";

export class MessageTextMemoryRepository {
    private messages: MessageText[] = [];

    async add(message:MessageText): Promise<void>{
        console.log(">>>>>>>>msg repositiry", message);
        this.messages.push(message);
    }

    async update(id: string, updateMessage:MessageText): Promise<void>{
        const messageIndex = this.messages.findIndex((message) => message.smsMessageSid === id);

        if(messageIndex < 0){
            throw new Error('Messagem não encontrada');
        }
        this.messages[messageIndex] = updateMessage;

    }
}*/ 
