import { AnyAaaaRecord } from "dns";
import path from 'path';
import { Twilio } from "twilio";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const URL = process.env.FILE_URL;
//const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

if (!accountSid || !authToken) {
    console.error(`-------------não carregou a env --> ${accountSid}`);
}

const client = new Twilio(accountSid!, authToken!);

export const sendMessage = async (from: string, to: string, body: string) => {
    try {
        const message = await client.messages.create({
            from,
            to,
            body,
        });
    } catch (error) {
        console.error("---------------->>>>>erro ao acessar o twilio", error);
    }
};


export async function sendInteractiveMessage( To: string, From : string, Tipo: string) {

    let SID = 'HXc2ba8f09860506886909d9223d1853cb';

    switch (Tipo) {
      case 'Despesa':
        SID = 'HXc2ba8f09860506886909d9223d1853cb';
        break;
      case 'Receita':
        SID = 'HX6ce1f39efc9eada883f870d0aea95d28';
        break;
      case 'Investimento':
        SID = 'HXc2ba8f09860506886909d9223d1853cb';
        break;
    
      default:
        SID = 'HXc2ba8f09860506886909d9223d1853cb';
        break;
    }

    try {
        const message = await client.messages.create({
            contentSid: `${SID}`,
            from: To,
            messagingServiceSid: "MGd3e5ec8692cb6c7983621534eccf6d6f",
            to: From,
          });
    } catch (error) {
      console.error('Erro ao enviar a mensagem:', error);
    }
}

export async function sendListPickerMessage( To: string, From: string) {
    try {
        const message = await client.messages.create({
            contentSid: "HXe74f9261c119e16a95cc62575eba646f",
            from: To,
            messagingServiceSid: "MGd3e5ec8692cb6c7983621534eccf6d6f",
            to: From,
          });
    } catch (error) {
      console.error('Erro ao enviar a mensagem:', error);
    }
}

export async function sendConfirmMessage( To: string, From: string, dados: string) {
  try {
      const message = await client.messages.create({
          contentSid: "HXbebfe4b67fd1a35c2c6179a2d1f858e1",
          contentVariables: JSON.stringify({
            detalhe_investimento: dados 
          }),
          from: To,
          messagingServiceSid: "MGd3e5ec8692cb6c7983621534eccf6d6f",
          to: From,
   
        });
  } catch (error) {
    console.error('Erro ao enviar a mensagem:', error);
  }
}

export async function sendConfirmPadraoMessage( To: string, From: string, dados: string) {
  try {
      const message = await client.messages.create({
          contentSid: "HX56d5469870327f13b001efc754af58e0",
          contentVariables: JSON.stringify({
            detalhe_dados: dados 
          }),
          from: To,
          messagingServiceSid: "MGd3e5ec8692cb6c7983621534eccf6d6f",
          to: From,
   
        });
  } catch (error) {
    console.error('Erro ao enviar a mensagem:', error);
  }
}

// Serviço para enviar o arquivo via WhatsApp
export const sendFileViaWhatsApp = async ( From: string, To: string, filename: string) => {
  try {
    //const fileUrl = `${URL}/file/${filename}`; // URL do arquivo
    const fileUrl = 'http://vanessafonsecaoficial.com/api/file/relatorio_financeiro_11116_20241122.xlsx';
 console.log("dados...", To, From, fileUrl)
  const message = await client.messages.create({
    from: From,
    to: To,
    mediaUrl: [fileUrl],
  });

  return message.sid; // Retorna o SID da mensagem enviada
} catch (error) {
  console.error('Erro ao enviar a mensagem:', error);
}
};









      
      
