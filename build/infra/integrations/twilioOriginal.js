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
const twilio_1 = require("twilio");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
if (accountSid == undefined) {
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
    }
    catch (error) {
        console.error("---------------->>>>>erro ao acessar o twilio", error);
    }
});
exports.sendMessage = sendMessage;
