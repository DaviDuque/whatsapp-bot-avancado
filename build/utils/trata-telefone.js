"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverterNumeroTelefone = exports.formatarNumeroTelefone = void 0;
const formatarNumeroTelefone = (telefone) => {
    // Remove a palavra 'whatsapp:' se estiver presente
    const regexWhatsapp = /^whatsapp:/;
    let telefoneFormatado = telefone.replace(regexWhatsapp, '');
    // Remove o prefixo +55
    const regex = /^\+55/;
    telefoneFormatado = telefoneFormatado.replace(regex, '');
    // Verifica se o número já tem o '9' após os dois primeiros dígitos
    const codigoArea = telefoneFormatado.substring(0, 2);
    const restanteDoNumero = telefoneFormatado.substring(2);
    // Adiciona o 9 após o código de área se não existir
    if (!restanteDoNumero.startsWith('9')) {
        telefoneFormatado = codigoArea + '9' + restanteDoNumero;
    }
    return telefoneFormatado;
};
exports.formatarNumeroTelefone = formatarNumeroTelefone;
const reverterNumeroTelefone = (telefone) => {
    // Verifica se o número tem o '9' após o código de área
    const codigoArea = telefone.substring(0, 2);
    let restanteDoNumero = telefone.substring(2);
    // Remove o '9' após o código de área, se ele existir
    if (restanteDoNumero.startsWith('9')) {
        restanteDoNumero = restanteDoNumero.substring(1); // Remove o primeiro '9' do restante do número
    }
    // Adiciona o prefixo +55 ao número
    const telefoneFormatado = `+55${codigoArea}${restanteDoNumero}`;
    return telefoneFormatado;
};
exports.reverterNumeroTelefone = reverterNumeroTelefone;
