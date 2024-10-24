import { Twilio } from "twilio";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

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
