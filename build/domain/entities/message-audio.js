"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageAudio = void 0;
class MessageAudio {
    constructor(smsMessageSid, MediaContentType0, NumMedia, mediaUrl0) {
        this.smsMessageSid = smsMessageSid;
        this.MediaContentType0 = MediaContentType0;
        this.NumMedia = NumMedia;
        this.mediaUrl0 = mediaUrl0;
    }
    isMediaMessage() {
        return this.NumMedia !== '0';
    }
    setTranscriptionText() {
    }
}
exports.MessageAudio = MessageAudio;
