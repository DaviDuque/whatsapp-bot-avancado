"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = void 0;
exports.sendInteractiveMessage = sendInteractiveMessage;
exports.sendListPickerMessage = sendListPickerMessage;
exports.sendConfirmMessage = sendConfirmMessage;
const twilio_1 = require("twilio");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
//const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
if (!accountSid || !authToken) {
    console.error(`-------------não carregou a env --> ${accountSid}`);
}
const client = new twilio_1.Twilio(accountSid, authToken);
const sendMessage = (from, to, body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = yield client.messages.create({
            from,
            to,
            body,
        });
        console.log("Mensagem enviada: ", message.sid);
    }
    catch (error) {
        console.error("---------------->>>>>erro ao acessar o twilio", error);
    }
});
exports.sendMessage = sendMessage;
function sendInteractiveMessage(To, From, Tipo) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const message = yield client.messages.create({
                contentSid: `${SID}`,
                //contentVariables: JSON.stringify({ 1: "Name" }),
                from: To,
                messagingServiceSid: "MGd3e5ec8692cb6c7983621534eccf6d6f",
                to: From,
            });
            console.log(message.body);
            console.log(`Mensagem enviada com sucesso! SID: ${message.sid}`);
        }
        catch (error) {
            console.error('Erro ao enviar a mensagem:', error);
        }
    });
}
function sendListPickerMessage(To, From) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`>>>>>>>>>>>>>TO: ${To}`);
        console.log(`>>>>>>>>>>>>>TO: ${From}`);
        try {
            const message = yield client.messages.create({
                contentSid: "HXe74f9261c119e16a95cc62575eba646f",
                //contentVariables: JSON.stringify({ 1: "Name" }),
                from: To,
                messagingServiceSid: "MGd3e5ec8692cb6c7983621534eccf6d6f",
                to: From,
            });
            console.log(message.body);
            console.log(`Mensagem enviada com sucesso! SID: ${message.sid}`);
        }
        catch (error) {
            console.error('Erro ao enviar a mensagem:', error);
        }
    });
}
function sendConfirmMessage(To, From) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`>>>>>>>>>>>>>TO: ${To}`);
        console.log(`>>>>>>>>>>>>>FROM: ${From}`);
        try {
            const message = yield client.messages.create({
                contentSid: "HXbebfe4b67fd1a35c2c6179a2d1f858e1",
                contentVariables: JSON.stringify({
                    detalhe_investimento: ` \u{1F4B5}Investimento: *Títulos*, *Valor:1500,00*, *Data:20/10/2024*`,
                }),
                from: To,
                messagingServiceSid: "MGd3e5ec8692cb6c7983621534eccf6d6f",
                to: From,
            });
            console.log(message.body);
            console.log(`Mensagem enviada com sucesso! SID: ${message.sid}`);
        }
        catch (error) {
            console.error('Erro ao enviar a mensagem:', error);
        }
    });
}
//HX56d5469870327f13b001efc754af58e0
