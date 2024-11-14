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
exports.cadastrarContaController = void 0;
const conta_repository_1 = require("./conta.repository");
const cadastrarContaController = (id_cliente, nome_conta, tipo, banco, limite, saldo) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, conta_repository_1.cadastrarConta)(id_cliente, nome_conta, tipo, banco, limite, saldo);
    }
    catch (error) {
        return error;
    }
});
exports.cadastrarContaController = cadastrarContaController;
