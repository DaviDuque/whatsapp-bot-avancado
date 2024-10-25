
import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { GlobalState } from '../../infra/states/global-state';
import { sendMessage } from '../../infra/integrations/twilio';


export class Menu{
  static showMenu = (req: Request, res: Response) => {
    const globalState = GlobalState.getInstance();

    // Exibindo o menu de opções
    const menuOptions = `
      1 - Cadastrar Despesas
      2 - Cadastrar Receitas
      3 - Extrair Relatório
    `;

    res.send(menuOptions);
  };

  static selectOption = async (req: Request, res: Response) => {
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
  };
}


