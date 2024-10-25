
import { Request, Response } from 'express';
import { GlobalState } from '../../infra/states/global-state';
import { sendMessage } from '../../infra/integrations/twilio';
import { getCommand } from "./commandManager";
import { isStringObject } from 'util/types';


export class Menu{
  static showMenu = (req: Request, res: Response) => {
    console.log("commmanddddd", req.body);
    const globalState = GlobalState.getInstance();
    const { From, To, Body } = req.body;
    
   
    const [commandName, ...args] = Body.split(' ');
    console.log("commandName ---> ", commandName);
    //const command = getCommand(commandName.toString().trim);
    const command = getCommand(commandName);
    console.log("command ---> ", command);
    if (command) {
        const response = command.execute(args);
        sendMessage(To, From, response);
    } else {
        sendMessage(To, From, '\u{1F63A} Olá, não entendiaaaaa. Comando não reconhecido. \u{2600} \n \u{1F3C4} Digite "8" para lista de opções. \n \u{1F525} Digite "9" para sair.');
    }
    res.send("Mensagem recebida!");
  };

  /*static selectOption = async (req: Request, res: Response) => {
    const { SmsMessageSid, MediaContentType0, NumMedia, Body, To, From, MediaUrl0 } = req.body;
    const globalState = GlobalState.getInstance();
    const { option } = req.body; // O cliente escolhe uma opção, por exemplo via POST

    switch (option) {
      case '1':
        globalState.clientMenuOption = 'Cadastrar Despesas';
        await sendMessage(To, From, "Você escolheu: Cadastrar Despesas");
        break;
      case '2':
        globalState.clientMenuOption = 'Cadastrar Receitas';
         await sendMessage(To, From, "Você escolheu: Cadastrar Receitas");
        break;
      case '3':
        globalState.clientMenuOption = 'Extrair Relatório';
         await sendMessage(To, From, "Você escolheu: Extrair Relatório");
        break;
      default:
         await sendMessage(To, From, "Opção inválida. Por favor, escolha novamente.");
        break;
    }
  };*/
}




