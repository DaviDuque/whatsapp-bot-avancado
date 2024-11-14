"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
class Message {
    constructor(smsMessageSid, mediaContentType0, numMedia, profileName, waId, body, to, from, mediaUrl0, transcriptionText) {
        this.smsMessageSid = smsMessageSid;
        this.mediaContentType0 = mediaContentType0;
        this.numMedia = numMedia;
        this.profileName = profileName;
        this.waId = waId;
        this.body = body;
        this.to = to;
        this.from = from;
        this.mediaUrl0 = mediaUrl0;
        this.transcriptionText = transcriptionText;
    }
    isMediaMessage() {
        return this.numMedia !== '0';
    }
    setTranscriptionText(transcribeText) {
        this.transcriptionText = transcribeText;
    }
}
exports.Message = Message;
