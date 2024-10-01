import { Twilio } from "twilio";

const accountSid = process.env.TWILIO_ACCONUT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);

export const sendMessage = async (from: string, to: string, body: string) => {
    try{
        const message = await client.messages.create({
            from,
            to,
            body,

        });

    }catch(error){
        console.error("erro ao acessar o twilio", error);
    }
}