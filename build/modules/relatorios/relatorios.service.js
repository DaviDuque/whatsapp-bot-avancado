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
exports.ListarInvestimentosPorClienteControler = exports.ListarReceitasPorClienteControler = exports.ListarDespesaPorClienteControler = void 0;
const despesas_repository_1 = require("../despesas/despesas.repository");
const receitas_repository_1 = require("../receitas/receitas.repository");
const investimentos_repository_1 = require("../investimentos/investimentos.repository");
const ListarDespesaPorClienteControler = (id_cliente, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield (0, despesas_repository_1.ListarDespesaPorCliente)(id_cliente, startDate, endDate);
    }
    catch (error) {
        return error;
    }
});
exports.ListarDespesaPorClienteControler = ListarDespesaPorClienteControler;
const ListarReceitasPorClienteControler = (id_cliente, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield (0, receitas_repository_1.ListarReceitasPorCliente)(id_cliente, startDate, endDate);
    }
    catch (error) {
        return error;
    }
});
exports.ListarReceitasPorClienteControler = ListarReceitasPorClienteControler;
const ListarInvestimentosPorClienteControler = (id_cliente, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield (0, investimentos_repository_1.ListarInvestimentosPorCliente)(id_cliente, startDate, endDate);
    }
    catch (error) {
        return error;
    }
});
exports.ListarInvestimentosPorClienteControler = ListarInvestimentosPorClienteControler;
