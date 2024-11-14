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
exports.cadastrarDespesaController = void 0;
const despesas_repository_1 = require("./despesas.repository");
const cadastrarDespesaController = (id_cliente, descricao, valor, data_despesa, categoria, parcelado) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, despesas_repository_1.cadastrarDespesa)(id_cliente, descricao, valor, data_despesa, categoria, parcelado);
    }
    catch (error) {
        return error;
    }
});
exports.cadastrarDespesaController = cadastrarDespesaController;
