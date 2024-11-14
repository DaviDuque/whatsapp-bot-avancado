"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummarizeMessageUseCase = void 0;
const message_1 = require("../../domain/entities/message");
class SummarizeMessageUseCase {
    constructor(summarizationService) {
        this.summarizationService = summarizationService;
    }
    execute(messageData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMessage = new message_1.Message(messageData.smsMessageSid, messageData.mediaContentType0, messageData.numMedia, messageData.profileName, messageData.waId, messageData.body, messageData.to, messageData.from, messageData.mediaUrl0);
            if (!newMessage.body) {
                console.log('Mensagem não identificada!');
                return undefined;
            }
            if (!newMessage.smsMessageSid) {
                return undefined;
            }
            console.log("summerize-message-usecase>>>>>>>>>>>>>>>>>requisição recebida", newMessage.body);
            //this.messageRepository.add(newMessage);
            console.log("summerize-message-usecase>>>>>>>>>>>>>>>>>adicionada a memoria");
            if (newMessage.body.length > 10) {
                const summarizedText = yield this.summarizationService.summarize(newMessage.body);
                // this.messageRepository.update(newMessage.smsMessageSid, newMessage);
                return summarizedText;
            }
            return newMessage.body;
        });
    }
}
exports.SummarizeMessageUseCase = SummarizeMessageUseCase;
