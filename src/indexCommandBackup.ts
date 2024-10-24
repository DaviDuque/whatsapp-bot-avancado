//esse index para bot simples co commander

import * as dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { sendMessage } from './infra/integrations/twilio';
import './commands';
import { getCommand } from './commandManager';
import { verificarClientePorTelefone } from './clienteService';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/whatsapp', async (req: Request, res: Response) => {
    const { From, To, Body } = req.body;
    const [commandName, ...args] = Body.split(' ');
    console.log("req...........",req.body);

    // Verificar se o cliente já está cadastrado
    const clienteCadastrado = await verificarClientePorTelefone(From);
    
    if (!clienteCadastrado) {
        sendMessage(To, From, '\u{1F63A} Olá, não encontramos seu cadastro. Por favor, registre-se antes de continuar.');
        return res.send("Cliente não cadastrado");
    }

    // Processar o comando
    const command = getCommand(commandName);
    if (command) {
        const response = command.execute(args);
        sendMessage(To, From, response);
    } else {
        sendMessage(To, From, '\u{1F63A} Olá, não entendiaaaaa. Comando não reconhecido. \u{2600} \n \u{1F3C4} Digite "8" para lista de opções. \n \u{1F525} Digite "9" para sair.');
    }
    
    res.send("Mensagem recebida!");
});

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
