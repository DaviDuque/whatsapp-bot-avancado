export class MessageAudio{
    
    constructor  (
        public readonly smsMessageSid?: string,
        public readonly MediaContentType0?: string, 
        public readonly NumMedia?: string, 
        public readonly mediaUrl0?: string,
    ){}

    isMediaMessage(): boolean{
        return this.NumMedia !== '0';

    }

    setTranscriptionText(): void {
        
    }
   

    

  
}



    

 