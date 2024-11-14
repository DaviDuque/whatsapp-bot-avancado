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
exports.TranscribeMessageController = void 0;
const message_audio_1 = require("../../domain/entities/message-audio");
class TranscribeMessageController {
    constructor(transcriptionService, audioService, messageRepository) {
        this.transcriptionService = transcriptionService;
        this.audioService = audioService;
        this.messageRepository = messageRepository;
    }
    execute(messageData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMessage = new message_audio_1.MessageAudio(messageData.smsMessageSid, messageData.mediaContentType0, messageData.numMedia, messageData.mediaUrl0);
            if (!newMessage.isMediaMessage()) {
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
            const mp3Path = yield this.audioService.download(newMessage.mediaUrl0);
            console.log(">>>>>>>>>>>>>>>>>memory 4");
            const transcription = yield this.transcriptionService.transcribe(mp3Path);
            console.log(">>>>>>>>>>>>>>>>>memory 5", transcription);
            if (!transcription) {
                return undefined;
            }
            return transcription;
        });
    }
}
exports.TranscribeMessageController = TranscribeMessageController;
