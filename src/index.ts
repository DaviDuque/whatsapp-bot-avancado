//index para cadastro

import * as dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Auth } from './infra/auth/auth';
import { authMiddleware } from './infra/auth/auth.middleware';
import { Clientes } from './modules/clientes/clientes.controller';
import { Despesas } from './modules/despesas/despesas.controller';
import { Receitas } from './modules/receitas/receitas.controller';
import { Investimentos } from './modules/investimentos/investimentos.controller';
import { Cartao } from './modules/cartao/cartao.controller';
import { Conta } from './modules/conta/conta.controller';
import { verificarClientePorTelefone, criarClientePorTelefone } from './modules/clientes/clientes.repository';
import { AudioService } from './infra/integrations/audio.service';
import { SummarizeServiceDespesas } from './infra/integrations/summarize.service';
import { GlobalState } from './infra/states/global-state';
import { getCommand } from './commandManager';
import { sendMessage } from './infra/integrations/twilio';


import { formatarNumeroTelefone } from './utils/trata-telefone';





const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Armazenamento temporário para os dados do cliente em processo de cadastro
const dadosClientesTemporarios: { [key: string]: any } = {};
const newCliente = new Clientes();
const newDespesas = new Despesas();
const newReceitas = new Receitas();
const newInvestimentos = new Investimentos();
const NewCartao = new Cartao();
const NewConta = new Conta();
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



 app.post('/whatsapp', async (req: Request, res: Response) => {
    const { From, To, Body } = req.body;
    const [commandName, ...args] = Body.split(' ');
    console.log("req...........",req.body);

    // Verificar se o cliente já está cadastrado
    const clienteCadastrado = await verificarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));

    console.log("cliente index...........",clienteCadastrado);
    
    if (!clienteCadastrado) {
        console.log("cliente index 2...........",clienteCadastrado);

        //await newReceitas.processarMensagemReceita(req, res);
        await newCliente.whatsapp(req, res);
        //await newDespesas.whatsapp(req, res);
    }

    if(clienteCadastrado){
        const cliente = globalState.getClientId();
        if(!cliente){
            const cliente_id = await criarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));
            globalState.setClientId(cliente_id);
            globalState.setClientCondition("inicial");
            globalState.setMensagem([
                req.body.SmsMessageSid,
                req.body.NumMedia,
                req.body.ProfileName,
                req.body.MessageType,
                req.body.SmsSid,
                req.body.WaId,
                req.body.SmsStatus,
                req.body.Body,
                req.body.To,
                req.body.NumSegments,
                req.body.ReferralNumMedia,
                req.body.MessageSid,
                req.body.AccountSid,
                req.body.From,
                req.body.ApiVersion
            ]
            );
        }

        
        const mensagem = globalState.getMensagem();
        console.log(`ID do cliente armazenado: ${globalState.getClientId()}`);
        console.log(`body do cliente armazenado-->: ${globalState.getMensagem()}`);
        console.log(`body do cliente armazenado-->: ${mensagem}`);
        console.log(`cliente condição-->: ${globalState.getClientCondition()}`)

        // Processar o comando
        if(globalState.getClientCondition() == 'inicial'){
            const command = getCommand(commandName);
            if (command) {
                const response = command.execute(args);
                sendMessage(To, From, response);
            } else {
                sendMessage(To, From, '\u{1F63A} Olá, \u{2600} \n \u{1F3C4} Digite "8" para lista de opções. \n \u{1F525} Digite "9" para sair.');
            }
        }else if(globalState.getClientCondition() == 'despesas' || globalState.getClientCondition() == 'despesas_2' || globalState.getClientCondition() == 'despesas_1'){
            console.log('-----despesas-----');
            await newDespesas.whatsapp(req, res);
        }else if(globalState.getClientCondition() == 'receitas' || globalState.getClientCondition() == 'receitas_2' || globalState.getClientCondition() == 'receitas_1'){
            console.log('-----receitas-----');
            await newReceitas.processarMensagemReceita(req, res);
        }else if(globalState.getClientCondition() == 'investimentos' || globalState.getClientCondition() == 'investimentos_1' || globalState.getClientCondition() == 'investimentos_2'){
            console.log('-----investimentos-----');
            await newInvestimentos.processarMensagemInvestimentos(req, res);
        }else if(globalState.getClientCondition() == 'cartao' || globalState.getClientCondition() == 'cartao_1' || globalState.getClientCondition() == 'cartao_2'){
            console.log('-----cartao-----');
            await NewCartao.whatsapp(req, res);
        }else if(globalState.getClientCondition() == 'conta' || globalState.getClientCondition() == 'conta_1' || globalState.getClientCondition() == 'conta_2'){
            console.log('-----conta-----');
            await NewConta.whatsapp(req, res);
        }else{
            globalState.setClientCondition('inicial');
            sendMessage(To, From, "Desculpe não entendi  mensagem");
        }
    }
    
    //res.send("Mensagem recebida!");
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










