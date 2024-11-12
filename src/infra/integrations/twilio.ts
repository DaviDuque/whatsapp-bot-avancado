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


export async function sendInteractiveMessage( To: string, From : string) {
    console.log(`>>>>>>>>>>>>>TO: ${To}`);
    console.log(`>>>>>>>>>>>>>TO: ${From}`);
    try {
        const message = await client.messages.create({
            contentSid: "HXc2ba8f09860506886909d9223d1853cb",
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

        /*export async function sendInteractiveMessage( To: string, From: string) {
            const message = await client.messages.create({
              contentSid: "HXc2ba8f09860506886909d9223d1853cb",
              //contentVariables: JSON.stringify({ 1: "Name" }),
              from: To,
              messagingServiceSid: "MGd3e5ec8692cb6c7983621534eccf6d6f",
              to: From,
            });
          
            console.log(message.body);
        }*/
          

      
      
