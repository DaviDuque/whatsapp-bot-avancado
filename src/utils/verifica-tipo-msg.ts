export const verificaTipoMsg = (NumMedia: string, MediaContentType0: string, MediaUrl0: string): string => {
    if (NumMedia === '1' && MediaContentType0 === 'audio/ogg' && MediaUrl0.length !== 0) {
        return "audio";
    } else if (NumMedia === '0') {
        return "texto";
    } else {
        return "inválido"; // Caso queira lidar com casos diferentes dos especificados
    }
}

