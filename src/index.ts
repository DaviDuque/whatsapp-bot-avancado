import * as dotenv from 'dotenv';
dotenv.config();
import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import { sendMessage } from './twilio';
import './commands';
import { getCommand } from "./commandManager";
import { AudioService } from './infra/audio.service';


const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.get('/', (req: Request, res: Response) => {
    res.send('gelo seco');
});

app.get('/bots', (req: Request, res: Response) => {
    res.json({
        message: 'Listando bots'
    })
});

app.post('/send', async(req: Request, res: Response) => {
    const {from, to, body} = req.body;
    console.log(">>>>>>>>>>>>>>>>");
    await sendMessage(from, to, body); 
    res.send("menssagem enviada!");
});

app.post('/whatsapp', async(req: Request, res: Response) => {
    const {From, To, Body} = req.body;
    const [commandName, ...args] = Body.split(' ');
    const command = getCommand(commandName);

    if(command){
        const response = command.execute(args);
        console.log(">>>>>>>>>>>>>>>>>.>>>tt");
        sendMessage(To, From, response); 
    }else{
        sendMessage(To, From, 'Comando não reconhecido. \n Envie "help" para lista de comandos');
    }
    
    res.send("menssagem recebida!");
});


app.get('/download', async (req: Request, res: Response) => {
   try {
    const serviceAudio = new AudioService();

    //const url = 'https://getsamplefiles.com/download/ogg/sample-1.ogg';
    const url = 'https://file-examples.com/storage/fe58a1f07d66f447a9512f1/2017/11/file_example_OOG_1MG.ogg';
    
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

app.listen(port, ()=> console.log(`Servidor rodando na porta ${port}`));