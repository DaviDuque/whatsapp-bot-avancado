
import dayjs from 'dayjs';

export const validarNome = (nome: string): boolean  => {
    
    if (nome.length < 5) {
        return false;
    }
    return true;
}

export const validarCpfCnpj = (cpfCnpj: string): boolean => {
    // Remove todos os caracteres que não são números
    cpfCnpj = cpfCnpj.replace(/[^\d]/g, '');

    if (cpfCnpj.length === 11) {
        return validarCPF(cpfCnpj);
    } else if (cpfCnpj.length === 14) {
        return validarCNPJ(cpfCnpj);
    } else {
        return false;
    }
}

export const validarCPF = (cpf: string): boolean => {
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
}

export const validarCNPJ = (cnpj: string): boolean => {
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
        if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    // Verifica o segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(1))) return false;

    return true;
}


export const validarEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export const validarDescricao = (descricao: string) => {
    console.log("validarDescricao---->",descricao.length > 0 && descricao.length <= 255);
    return descricao.length > 0 && descricao.length <= 255;
};

export const validarValor = (valor: number) => {
    console.log("validarValor---->", valor > 0);
    return valor > 0;
};

export const validarData = (data: string) => {
    console.log("validarData---->", data);
    const regex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
    console.log("validarData---->", regex.test(data));
    return regex.test(data);
};




