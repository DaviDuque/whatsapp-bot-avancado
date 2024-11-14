"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cliente = void 0;
class Cliente {
    constructor(id_cliente, nome, email, telefone, cpf, id_endereco, codigo_indicacao, codigo_proprio, senha) {
        this.id_cliente = id_cliente;
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
        this.cpf = cpf;
        this.id_endereco = id_endereco;
        this.codigo_indicacao = codigo_indicacao;
        this.codigo_proprio = codigo_proprio;
        this.senha = senha;
    }
}
exports.Cliente = Cliente;
