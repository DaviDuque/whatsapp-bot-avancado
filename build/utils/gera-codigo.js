"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomCode = void 0;
const generateRandomCode = (length, tel) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomCode = '' + tel;
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomCode += characters.charAt(randomIndex);
    }
    return randomCode;
};
exports.generateRandomCode = generateRandomCode;
