import { Message } from "../entities/message";
import { MessageAudio } from "../entities/message-audio";

export interface MessageRepositoryInterface {
    add(message: Message): Promise<void>;
    update(id: string, updateMessage: Message): Promise<void>;   
}


export interface MessageAudioRepositoryInterface {
    add(message: MessageAudio): Promise<void>;
    update(id: string, updateMessage: MessageAudio): Promise<void>;   
}

