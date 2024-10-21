export class Message{
    
    constructor  (
        public readonly smsMessageSid?: string,
        public readonly mediaContentType0?: string,
        public readonly numMedia?: string,
        public readonly profileName?: string,
        public readonly waId?: string,
        public readonly body?: string,
        public readonly to?: string,
        public readonly from?: string,
        public readonly mediaUrl0?: any ,
        public transcriptionText?: string,
        
    ){
        
        

    }
    isMediaMessage(): boolean{
        return this.numMedia !== '0';

    }

    setTranscriptionText(transcribeText: string): void {
        this.transcriptionText = transcribeText;
    }
}



    

 