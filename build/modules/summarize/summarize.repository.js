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
exports.SummarizeController = void 0;
const message_1 = require("../../domain/entities/message");
class SummarizeController {
    constructor(summarizationService, messageRepository) {
        this.summarizationService = summarizationService;
        this.messageRepository = messageRepository;
    }
    execute(messageData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMessage = new message_1.Message(messageData.body);
            if (!newMessage.smsMessageSid) {
                console.log('Mensagem não recebida!');
                return undefined;
            }
            if (!newMessage.body) {
                console.log('Mensagem sem corpo!');
                return undefined;
            }
            this.messageRepository.add(newMessage);
            const summarizeTranscription = yield this.summarizationService.summarize(newMessage.body);
            newMessage.setTranscriptionText(summarizeTranscription);
            this.messageRepository.update(newMessage.smsMessageSid, newMessage);
            return summarizeTranscription;
        });
    }
}
exports.SummarizeController = SummarizeController;
