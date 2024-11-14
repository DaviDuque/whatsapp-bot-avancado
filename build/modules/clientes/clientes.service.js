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
exports.cadastrarClienteController = exports.cadastrarClientePainelController = exports.processarCliente = void 0;
//clientes.service.ts
const clientes_repository_1 = require("./clientes.repository");
const trata_telefone_1 = require("../../utils/trata-telefone");
const processarCliente = (cliente) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clienteExiste = yield (0, clientes_repository_1.verificarClientePorTelefone)((0, trata_telefone_1.formatarNumeroTelefone)(cliente.telefone.replace(/^whatsapp:/, '')));
        if (clienteExiste) {
            return 'Cliente já cadastrado.';
        }
        else {
            console.log("chegou na service", cliente);
            yield (0, clientes_repository_1.cadastrarCliente)(cliente);
            return 'Cliente cadastrado com sucesso.';
        }
    }
    catch (error) {
        console.error('Erro ao processar o cliente:', error);
        throw new Error('Falha ao processar o cliente. Tente novamente mais tarde.');
    }
});
exports.processarCliente = processarCliente;
const cadastrarClientePainelController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cliente = req.body;
    console.log("cadastrar cliente", cliente);
    try {
        const resultado = yield (0, exports.processarCliente)(cliente);
        res.status(200).json({ message: resultado });
    }
    catch (error) {
        res.status(500).json({ message: 'Erro ao processar cliente.', error });
    }
});
exports.cadastrarClientePainelController = cadastrarClientePainelController;
const cadastrarClienteController = (cliente) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("cadastrar cliente", cliente);
    try {
        const resultado = yield (0, exports.processarCliente)(cliente);
        return resultado;
    }
    catch (error) {
        return ({ message: 'Erro ao processar cliente.', error });
    }
});
exports.cadastrarClienteController = cadastrarClienteController;
