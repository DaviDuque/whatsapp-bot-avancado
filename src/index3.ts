import * as dotenv from 'dotenv';
dotenv.config();
import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import { sendMessage } from './infra/integrations/twilio';
import './commands';
import { getCommand } from "./commandManager";
import { AudioService } from './infra/integrations/audio.service';
import { TranscriptionService } from './infra/integrations/transcription.service';
import { SummarizeService } from './infra/integrations/summarize.service';
import { TranscribeMessageUseCase } from './usecase/transcribe-message/transcribe-message.usecase';
import { TranscribeMessageController } from './modules/transcribe/transcribe.repository';
import { MessageMemoryRepository } from './infra/memory/message-memory.repository';
import { MessageTextMemoryRepository } from './infra/memory/message-text-memory.repository';
import { SummarizeMessageUseCase } from './usecase/message-text/summerize-message.usecase';
import { Auth } from './infra/auth/auth';
import { authMiddleware } from './infra/auth/auth.middleware';


const app = express();
const port = 3000;
console.log("index3 completo");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.get('/', authMiddleware, (req: Request, res: Response) => {
    res.send('gelo seco');
});

const authUsercase = new Auth();

app.post('/login', authUsercase.login);
app.post('/register', authMiddleware, authUsercase.register);
app.post('/refresh-token', authUsercase.refreshToken);


app.get('/download', async (req: Request, res: Response) => {
    try {
     const serviceAudio = new AudioService();
 
     const url = process.env.AUDIO_OGG_FILE_PATH;
     
     if (url == undefined) {
         res.status(400).send('url não informada')
         return;
     }
     const response = await serviceAudio.download(url);
     res.json({url: response});
    } catch (error) {
     console.log(';;;;', error);
       res.status(500).send(error);
    }
 });

 app.post('/whatsapp', async(req: Request, res: Response) => {

    const { SmsMessageSid, MediaContentType0, NumMedia, ProfileName, WaId, Body, To, From, MediaUrl0, TranscribeText }  = req.body;
    

    if(NumMedia =='1' && MediaContentType0 == 'audio/ogg' && MediaUrl0.length !== 0){
        console.log(">>>midia>>>", req.body);
        const transcriptionService = new TranscriptionService();
        const audioService = new AudioService();
        const messageRepository = new MessageMemoryRepository();

        const transcribeMessageController = new TranscribeMessageController(
            transcriptionService,
            audioService,
            messageRepository
        );

        const response = await transcribeMessageController.execute({
           smsMessageSid: SmsMessageSid,
           mediaContentType0: MediaContentType0,
           numMedia: NumMedia,       
           profileName: ProfileName,
           waId: WaId,
           body: Body,
           to: To,
           from: From,
           mediaUrl0: MediaUrl0,
           transcribeText: TranscribeText
        });
        
        if (!response) {
            sendMessage(To, From, 'Não foi possível transcrever a msg');
            return;
        }

        //sendMessage(To, From, response);
        console.log(To, From, response);
        return;
    }
    


    const [commandName, ...args] = Body.split(' ');
    const command = getCommand(commandName);

    if(command){
        const response = command.execute(args);
        sendMessage(To, From, response); 
    }else{
        sendMessage(To, From, 'OPS! não identificamos a msg. \n Envie "help" para lista de comandos');
    }
});


/*app.post('/whatsapp2', async(req: Request, res: Response) => {

    const { SmsMessageSid, MediaContentType0, NumMedia, ProfileName, WaId, Body, To, From, MediaUrl0, TranscribeText }  = req.body;
    

    if(NumMedia =='1' && MediaContentType0 == 'audio/ogg' && MediaUrl0.length !== 0){
        console.log(">>>midia>>>", req.body);
        const transcriptionService = new TranscriptionService();
        const audioService = new AudioService();
        const summarizeService = new SummarizeService();
        const messageRepository = new MessageMemoryRepository();

        const transcribeMessageUseCase = new TranscribeMessageUseCase(
            transcriptionService,
            audioService,
            summarizeService,
            messageRepository
        );

        const response = await transcribeMessageUseCase.execute({
           smsMessageSid: SmsMessageSid,
           mediaContentType0: MediaContentType0,
           numMedia: NumMedia,       
           profileName: ProfileName,
           waId: WaId,
           body: Body,
           to: To,
           from: From,
           mediaUrl0: MediaUrl0,
           transcribeText: TranscribeText
        });
        
        if (!response) {
            sendMessage(To, From, 'Não foi possível transcrever a msg');
            return;
        }

        //sendMessage(To, From, response);
        console.log(To, From, response);
        return;
    }
    

    if(SmsMessageSid){
        console.log(">>>texto>>>", req.body);
        const summarizeService = new SummarizeService();
        const messageTextRepository = new MessageTextMemoryRepository();

        const summarizeMessageUseCase = new SummarizeMessageUseCase(
            summarizeService,
            messageTextRepository
        );
         console.log(">>>>>>>>>ponto 0");
         const response = await summarizeMessageUseCase.execute({
            smsMessageSid: SmsMessageSid,
            mediaContentType0: MediaContentType0, 
            numMedia: NumMedia, 
            profileName: ProfileName, 
            waId: WaId,
            body: Body,
            to: To,
            from: From,
            mediaUrl0: MediaUrl0
         });


        if (!response) {
            sendMessage(To, From, 'Não foi possível transcrever a msg');
            return;
        }

        //sendMessage(To, From, response);
        console.log(To, From, response);
        return;
    }


    const [commandName, ...args] = Body.split(' ');
    const command = getCommand(commandName);

    if(command){
        const response = command.execute(args);
        sendMessage(To, From, response); 
    }else{
        sendMessage(To, From, 'OPS! não identificamos a msg. \n Envie "help" para lista de comandos');
    }
});
*/

/*app.post('/whatsapp1', async(req: Request, res: Response) => {
    const {From, To, Body} = req.body;
    const [commandName, ...args] = Body.split(' ');
    const command = getCommand(commandName);

    if(command){
        const response = command.execute(args);
        sendMessage(To, From, response); 
    }else{
        sendMessage(To, From, '\u{1F63A} Ola, não entendi. Comando não reconhecido. \u{2600} \n \u{1F3C4} digite "8" para lista de opções. \n \u{1F525} digite "9" para sair. ');
    }
    
    res.send("menssagem recebida!");
});
*/



app.listen(port, ()=> console.log(`Servidor rodando na porta ${port}`));