//index para cadastro

import * as dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import './commands';
import { Auth } from './infra/auth/auth';
import { authMiddleware } from './infra/auth/auth.middleware';
import { Clientes } from './modules/clientes/clientes.controller';
import { Despesas } from './modules/despesas/despesas.controller';
import { verificarClientePorTelefone } from './modules/clientes/clientes.repository';
import { formatarNumeroTelefone } from './utils/trata-telefone';
import { AudioService } from './infra/integrations/audio.service';
import { SummarizeServiceDespesas } from './infra/integrations/summarize.service';
import { criarClientePorTelefone } from './modules/clientes/clientes.repository';
import { GlobalState } from './infra/states/global-state';


const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Armazenamento temporário para os dados do cliente em processo de cadastro
const dadosClientesTemporarios: { [key: string]: any } = {};
const newCliente = new Clientes();
const newDespesas = new Despesas();
const globalState = GlobalState.getInstance();
const authUsercase = new Auth();



app.get('/', (req: Request, res: Response) => {
    res.send('gelo seco');
});

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


// Rota para o WhatsApp
app.post('/whatsapp', async (req, res) => {
    const { From } = req.body;
    const clienteCadastrado = await verificarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));
   
    
    
    if(!clienteCadastrado){
        await newCliente.whatsapp(req, res);
    }

    if(clienteCadastrado){
        const cliente_id = await criarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));
        // Armazene o ID do cliente no estado global
        globalState.setClientId(cliente_id);
        console.log(`ID do cliente armazenado: ${globalState.getClientId()}`);
        console.log("clientenn---->", cliente_id);
        await newDespesas.whatsapp(req, res);
    }
  
});


app.get('/summarize', async (req: Request, res: Response) => {
    try {
     const summarizeServiceDespesas = new SummarizeServiceDespesas();
 
     const text =  `supermercado, 25,00, 10/10/2024, tsste, n`;
     
     const response = await summarizeServiceDespesas.summarize(text);
     res.json({text: response});
    } catch (error) {
     console.log(';;;;', error);
       res.status(500).send(error);
    }
 });



app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));










