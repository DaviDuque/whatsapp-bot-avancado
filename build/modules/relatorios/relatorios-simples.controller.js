"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelatoriosSimples = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const relatorios_service_1 = require("./relatorios.service");
const relatorios_service_2 = require("./relatorios.service");
const relatorios_service_3 = require("./relatorios.service");
const relatorios_repository_1 = require("./relatorios.repository");
const dayjs_1 = __importDefault(require("dayjs"));
class RelatoriosSimples {
    constructor() {
        this.RelatorioSimples = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_cliente, data_inicial, data_final } = req.body;
                const resultadoDespesas = yield (0, relatorios_service_1.ListarDespesaPorClienteControler)(id_cliente, data_inicial, data_final);
                const resultadoReceitas = yield (0, relatorios_service_2.ListarReceitasPorClienteControler)(id_cliente, data_inicial, data_final);
                const resultadoInvestimentos = yield (0, relatorios_service_3.ListarInvestimentosPorClienteControler)(id_cliente, data_inicial, data_final);
                const dataRelatorio = { resultadoReceitas, resultadoDespesas, resultadoInvestimentos };
                const csvContent = this.convertToCSV(resultadoDespesas, resultadoReceitas, resultadoInvestimentos);
                // Gera e salva o arquivo CSV no diretório ../../bucket
                const fileName = `relatorio_${(0, dayjs_1.default)().format('YYYY-MM-DD_HH-mm-ss')}`;
                const filePath = yield (0, relatorios_repository_1.generateCSVFile)(csvContent, fileName);
                console.log("resultado file >>>,", filePath);
                yield (0, relatorios_repository_1.saveReportToDatabase)(id_cliente, "Relatorio", data_inicial, data_final, csvContent);
                console.log("resultado>>>,", csvContent);
                res.status(200).json(csvContent);
            }
            catch (error) {
                res.status(400).json({ message: error });
            }
        });
        this.convertToCSV = (despesas, receitas, investimentos) => {
            const header = "Descrição,Valor,Data,Categoria,Tipo\n";
            let csvContent = header;
            const allData = [
                ...despesas.map(d => (Object.assign(Object.assign({}, d), { tipo: 'Despesa' }))),
                ...receitas.map(r => (Object.assign(Object.assign({}, r), { tipo: 'Receita' }))),
                ...investimentos.map(i => (Object.assign(Object.assign({}, i), { tipo: 'Investimento' })))
            ];
            let total = 0;
            allData.forEach((item) => {
                csvContent += `${item.descricao},${item.valor},${item.data},${item.categoria},${item.tipo}\n`;
                total += parseFloat(item.valor);
            });
            csvContent += `\nTotal,,${total.toFixed(2)},,\n`;
            return csvContent;
        };
    }
}
exports.RelatoriosSimples = RelatoriosSimples;
