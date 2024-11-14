"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateToYYYYMMDD = void 0;
const formatDateToYYYYMMDD = (dateStr) => {
    // Converter para string, caso não seja
    const dateAsString = String(dateStr);
    // Regex para validar os formatos DD/MM/YYYY e DD-MM-YYYY
    const regex = /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/;
    const match = dateAsString.match(regex);
    if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // Mês no JS começa do 0
        const year = parseInt(match[3], 10);
        // Validar se a data é válida criando uma nova data
        const parsedDate = new Date(year, month, day);
        // Verificar se os componentes da data estão corretos
        if (parsedDate.getFullYear() === year &&
            parsedDate.getMonth() === month &&
            parsedDate.getDate() === day) {
            // Retornar no formato YYYY-MM-DD
            const formattedDate = parsedDate.toISOString().split('T')[0];
            return formattedDate;
        }
    }
    return null; // Retorna null se a data não for válida
};
exports.formatDateToYYYYMMDD = formatDateToYYYYMMDD;
