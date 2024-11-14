"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.transcribe = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const audio_service_1 = require("../../infra/integrations/audio.service");
const transcription_service_1 = require("../../infra/integrations/transcription.service");
const transcribe_repository_1 = require("./transcribe.repository");
const message_memory_repository_1 = require("../../infra/memory/message-memory.repository");
const transcribe = (SmsMessageSid, NumMedia, Body, MediaContentType0, MediaUrl0) => __awaiter(void 0, void 0, void 0, function* () {
    if (NumMedia == '1' && MediaContentType0 == 'audio/ogg' && MediaUrl0.length !== 0) {
        console.log(">>>midia>>>", SmsMessageSid, NumMedia, MediaContentType0, MediaUrl0);
        const transcriptionService = new transcription_service_1.TranscriptionService();
        const audioService = new audio_service_1.AudioService();
        const messageRepository = new message_memory_repository_1.MessageMemoryRepository();
        const transcribeMessageController = new transcribe_repository_1.TranscribeMessageController(transcriptionService, audioService, messageRepository);
        const response = yield transcribeMessageController.execute({
            smsMessageSid: SmsMessageSid,
            mediaContentType0: MediaContentType0,
            numMedia: NumMedia,
            mediaUrl0: MediaUrl0
        });
        if (!response) {
            return Body;
        }
        return response;
    }
    else {
        return Body;
    }
});
exports.transcribe = transcribe;
