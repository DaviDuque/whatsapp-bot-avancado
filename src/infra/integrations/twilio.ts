import { AnyAaaaRecord } from "dns";
import { Twilio } from "twilio";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

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
/*
export const sendInteractiveMessage = async (from: string, to: string, body: string) => {
    try {
        const message = await client.messages.create({
            from,
            to,
            body,
            content: {
                type: 'interactive',
                interactive: {
                    type: 'button',
                    body: {
                        text: 'Deseja confirmar a despesa?'
                    },
                    action: {
                        buttons: [
                            { type: 'reply', reply: { id: 'yes', title: 'Sim' } },
                            { type: 'reply', reply: { id: 'no', title: 'Não' } }
                        ]
                    }
                }
            }
        });
        console.log("Mensagem interativa enviada: ", message.sid);
    } catch (error) {
        console.error("---------------->>>>>erro ao acessar o Twilio", error);
    }
};*/

/*export const sendInteractiveMessage = async (to: string, from: string) => {
    console.log("*****************T0--**-From-**:",  to, from);
    try {
        const message = await client.messages.create({
            to,
            from,
            contentSid: "HX6daa6c3977036699fb8bdae1f40f9227", // ID do template de conteúdo interativo criado no Twilio
            contentVariables: JSON.stringify({
                1: "Confirmar a despesa", // Variável personalizada
                2: "Não confirmar a despesa"
            }),
            messagingServiceSid: "MG470e198897114a0b473e57509deddb7b"
        });
        console.log("Mensagem enviada: ", message.sid);
    } catch (error) {
        console.error("Erro ao enviar mensagem interativa:", error);
    }
};*/

/*export const sendInteractiveMessage = async (to: string, from: string) => {
    console.log("*****************To:", to);
    try {
        const message = await client.messages.create({
            to,
            from,
            //messagingServiceSid: "MG470e198897114a0b473e57509deddb7b",
            contentSid: "HX6daa6c3977036699fb8bdae1f40f9227", // ID do template de conteúdo interativo criado no Twilio
            contentVariables: JSON.stringify({
                1: "Confirmar a despesa", // Variável personalizada
                2: "Não confirmar a despesa"
            }),
        });
        console.log("Mensagem enviada: ", message.sid);
    } catch (error) {
        console.error("Erro ao enviar mensagem interativa:", error);
    }
};*/

export const sendInteractiveMessage = async(to: string, from: string) => {
    const message = await client.messages.create({
      contentSid: "HX6daa6c3977036699fb8bdae1f40f9227",
      /*contentVariables: JSON.stringify({
        1: "Sim", // Variável personalizada
        2: "Não"
    }),*/
      from,
      messagingServiceSid: "MG470e198897114a0b473e57509deddb7b",
      to,
    });
  
    console.log(message.body);
  }