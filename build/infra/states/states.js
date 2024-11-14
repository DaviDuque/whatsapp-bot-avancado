"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.atualizarClienteEstado = exports.verificarClienteEstado = exports.limparEstado = exports.atualizarEstado = exports.verificarEstado = void 0;
const estados = {}; // Armazenar o estado temporário
const clientes = {}; // Armazenar o cliente estado 
const verificarEstado = (telefone) => {
    return estados[telefone];
};
exports.verificarEstado = verificarEstado;
const atualizarEstado = (telefone, estado) => {
    estados[telefone] = estado;
};
exports.atualizarEstado = atualizarEstado;
const limparEstado = (telefone) => {
    delete estados[telefone];
};
exports.limparEstado = limparEstado;
const verificarClienteEstado = (id_cliente) => {
    return clientes[id_cliente] = id_cliente;
};
exports.verificarClienteEstado = verificarClienteEstado;
const atualizarClienteEstado = (id_cliente) => {
    clientes[id_cliente] = id_cliente;
    console.log("clientes state--->", clientes[id_cliente]);
};
exports.atualizarClienteEstado = atualizarClienteEstado;
