"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarData = exports.validarValorTotal = exports.validarValor = exports.validarDescricao = exports.validarEmail = exports.validarCNPJ = exports.validarCPF = exports.validarCpfCnpj = exports.validarNome = void 0;
const validarNome = (nome) => {
    if (nome.length < 5) {
        return false;
    }
    return true;
};
exports.validarNome = validarNome;
const validarCpfCnpj = (cpfCnpj) => {
    // Remove todos os caracteres que não são números
    cpfCnpj = cpfCnpj.replace(/[^\d]/g, '');
    if (cpfCnpj.length === 11) {
        return (0, exports.validarCPF)(cpfCnpj);
    }
    else if (cpfCnpj.length === 14) {
        return (0, exports.validarCNPJ)(cpfCnpj);
    }
    else {
        return false;
    }
};
exports.validarCpfCnpj = validarCpfCnpj;
const validarCPF = (cpf) => {
    // Remove todos os caracteres que não são números
    cpf = cpf.replace(/[^\d]/g, '');
    // Verifica se o CPF tem 11 dígitos ou se todos os números são iguais
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    // Calcula os dígitos verificadores
    let soma = 0;
    let resto;
    // Verifica o primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.substring(9, 10))) {
        return false;
    }
    // Verifica o segundo dígito verificador
    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.substring(10, 11))) {
        return false;
    }
    return true;
};
exports.validarCPF = validarCPF;
const validarCNPJ = (cnpj) => {
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
        return false;
    }
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    // Verifica o primeiro dígito verificador
    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2)
            pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0)))
        return false;
    // Verifica o segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(1)))
        return false;
    return true;
};
exports.validarCNPJ = validarCNPJ;
const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};
exports.validarEmail = validarEmail;
const validarDescricao = (descricao) => {
    console.log("validarDescricao---->", descricao.length > 3 && descricao.length <= 255);
    return descricao.length > 0 && descricao.length <= 255;
};
exports.validarDescricao = validarDescricao;
const validarValor = (valor) => {
    console.log("validarValor---->", valor > 0);
    return valor > 0;
};
exports.validarValor = validarValor;
const validarValorTotal = (valor) => {
    console.log("validarValor---->", typeof valor === 'number' && !isNaN(valor));
    return typeof valor === 'number' && !isNaN(valor);
};
exports.validarValorTotal = validarValorTotal;
const validarData = (data) => {
    console.log("validarData---->", data);
    const regex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
    console.log("validarData---->", regex.test(data));
    return regex.test(data);
};
exports.validarData = validarData;
