import { AnyAaaaRecord } from "dns";
import { Twilio } from "twilio";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
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
        console.log("Mensagem enviada: ", message.sid);
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
   /* if (Tipo === 'Despesa'){
      SID = 'HXc2ba8f09860506886909d9223d1853cb';
    }
    if (Tipo === 'Receita'){
      SID = 'HX6ce1f39efc9eada883f870d0aea95d28';
    }

    if (Tipo === 'Investimento'){
      SID = 'HXc2ba8f09860506886909d9223d1853cb';
    }
    if (Tipo === 'cartao'){
      SID = 'HXc2ba8f09860506886909d9223d1853cb';
    }
    if (Tipo === 'conta'){
      SID = 'HXc2ba8f09860506886909d9223d1853cb';
    }
    if (Tipo === 'relatorio'){
      SID = 'HXc2ba8f09860506886909d9223d1853cb';
    }*/
    console.log(`>>>>>>>>>>>>>TO: ${To}`);
    console.log(`>>>>>>>>>>>>>TO: ${From}`);
    try {
        const message = await client.messages.create({
            contentSid: `${SID}`,
            //contentVariables: JSON.stringify({ 1: "Name" }),
            from: To,
            messagingServiceSid: "MGd3e5ec8692cb6c7983621534eccf6d6f",
            to: From,
          });
        
          console.log(message.body);
          console.log(`Mensagem enviada com sucesso! SID: ${message.sid}`);
    } catch (error) {
      console.error('Erro ao enviar a mensagem:', error);
    }
}

       
          

export async function sendListPickerMessage( To: string, From: string) {
    console.log(`>>>>>>>>>>>>>TO: ${To}`);
    console.log(`>>>>>>>>>>>>>TO: ${From}`);
    try {
        const message = await client.messages.create({
            contentSid: "HXe74f9261c119e16a95cc62575eba646f",
            //contentVariables: JSON.stringify({ 1: "Name" }),
            from: To,
            messagingServiceSid: "MGd3e5ec8692cb6c7983621534eccf6d6f",
            to: From,
          });
        
          console.log(message.body);
          console.log(`Mensagem enviada com sucesso! SID: ${message.sid}`);
    } catch (error) {
      console.error('Erro ao enviar a mensagem:', error);
    }
}

export async function sendConfirmMessage( To: string, From: string, dados: string) {
  console.log(`>>>>>>>>>>>>>TO: ${To}`);
  console.log(`>>>>>>>>>>>>>FROM: ${From}`);
  console.log(`>>>>>>>>>>>>>dados: ${dados}`);
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
      
        console.log(message.body);
        console.log(`Mensagem enviada com sucesso! SID: ${message.sid}`);
  } catch (error) {
    console.error('Erro ao enviar a mensagem:', error);


  }
}

export async function sendConfirmPadraoMessage( To: string, From: string, dados: string) {
  console.log(`>>>>>>>>>>>>>TO: ${To}`);
  console.log(`>>>>>>>>>>>>>FROM: ${From}`);
  console.log(`>>>>>>>>>>>>>dados: ${dados}`);
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
      
        console.log(message.body);
        console.log(`Mensagem enviada com sucesso! SID: ${message.sid}`);
  } catch (error) {
    console.error('Erro ao enviar a mensagem:', error);


  }
}









      
      
