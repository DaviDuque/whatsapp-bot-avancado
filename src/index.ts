import * as dotenv from 'dotenv';
dotenv.config();
import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import { sendMessage } from './twilio';
import './commands';
import { getCommand } from "./commandManager";
import { AudioService } from './infra/service/audio.service';
import { TranscriptionService } from './infra/service/transcription.service';
import { SummarizeService } from './infra/service/summarize.service';
import { TranscribeMessageUseCase } from './usecase/transcribe-message/transcribe-message.usecase';
import { MessageMemoryRepository } from './infra/memory/message-memory.repository';



const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.get('/', (req: Request, res: Response) => {
    res.send('gelo seco');
});


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
    
    console.log(">>>body>>>", req.body);
    if(NumMedia =='1' && MediaContentType0 == 'audio/ogg' && MediaUrl0.length !== 0){
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
         console.log(">>>>>>>>>ponto 0", MediaContentType0);
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

        sendMessage(To, From, response);
        return;
    }
    const [commandName, ...args] = Body.split(' ');
    const command = getCommand(commandName);

    if(command){
        const response = command.execute(args);
        sendMessage(To, From, response); 
    }else{
        sendMessage(To, From, 'Ola, envie um audio para transcrição. \n Envie "help" para lista de comandos');
    }
    
    //res.send("menssagem recebida!");
});



app.listen(port, ()=> console.log(`Servidor rodando na porta ${port}`));