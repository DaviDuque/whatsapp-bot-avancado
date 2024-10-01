import * as dotenv from 'dotenv';
dotenv.config();
import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import { sendMessage } from './twilio';
import './commands';
import { getCommand } from "./commandManager";


const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.get('/', (req: Request, res: Response) => {
    res.send('Galo Doido');
});



app.post('/whatsapp', async(req: Request, res: Response) => {
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

app.listen(port, ()=> console.log(`Servidor rodando na porta ${port}`));