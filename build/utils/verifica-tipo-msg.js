"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificaTipoMsg = void 0;
const verificaTipoMsg = (NumMedia, MediaContentType0, MediaUrl0) => {
    if (NumMedia === '1' && MediaContentType0 === 'audio/ogg' && MediaUrl0.length !== 0) {
        return "audio";
    }
    else if (NumMedia === '0') {
        return "texto";
    }
    else {
        return "inválido"; // Caso queira lidar com casos diferentes dos especificados
    }
};
exports.verificaTipoMsg = verificaTipoMsg;
