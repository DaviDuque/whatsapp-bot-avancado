"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commandManager_1 = require("./commandManager");
const global_state_1 = require("./infra/states/global-state");
const globalState = global_state_1.GlobalState.getInstance();
const cliente = globalState.getClientId();
(0, commandManager_1.addCommand)({
    name: '',
    description: '\u{1F44B} Escolha uma opção abaixo \u{1F4BB}',
    execute: () => 'Ainda não consigo processar essa requisição, mas estamos trabalhando nisso. \n \u{2600} Digite 8 para voltar ao menu. \n \u{1F525} Digite 9 para sair.'
});
(0, commandManager_1.addCommand)({
    name: '1',
    description: '\u{1F648}Digite \u{0031}\u{FE0F}\u{20E3} para entrar com *gastos e despesas* ',
    execute: () => {
        globalState.setClientCondition("despesas");
        return `\u{1F44D} Para cadastrar uma despesa, digite ou fale os detalhes: 
*Nome da despesa*
*data* 
*Valor*
*Método de pagamento* (Crédito parcelado, Crédito a vista, Débito, PIX, Cartão BHBus, Vale alimentação, Vale refeição)
`;
    },
});
(0, commandManager_1.addCommand)({
    name: '2',
    description: '\u{1F60E}Digite \u{0032}\u{FE0F}\u{20E3} para Entrada de *receita*',
    execute: () => {
        globalState.setClientCondition("receitas");
        return `\u{1F4B5}Para cadastrar uma receita, digite ou fale os detalhes como: 
*Nome da receita*
*Valor*
*Data*
`;
    },
});
(0, commandManager_1.addCommand)({
    name: '3',
    description: '\u{1F4B0}Digite \u{0033}\u{FE0F}\u{20E3} para Entrada de *investimentos*',
    execute: () => {
        globalState.setClientCondition("investimentos");
        return `\u{1F44D} Para cadastrar uma investimento, envie os detalhes: 
*Nome da investimento*
*Valor*
*Data*
*Categoria*
`;
    },
});
(0, commandManager_1.addCommand)({
    name: '4',
    description: '\u{1F4F1}Digite \u{0034}\u{FE0F}\u{20E3} para cadastrar um *relatório*',
    execute: () => {
        globalState.setClientCondition("relatorio");
        return `\u{1F4CB}Para buscar um relatório, digite ou fale os detalhes:
*Data inicial*
*Data final*
`;
    },
});
(0, commandManager_1.addCommand)({
    name: '5',
    description: '\u{1F3E6}Digite \u{0035}\u{FE0F}\u{20E3} para cadastrar uma *Meta*',
    execute: () => {
        globalState.setClientCondition("meta");
        return `
\u{1F4B7}Para cadastrar uma meta, digite ou fale os detalhes:
*Nome da meta*
*valor_objetivo*
*valor_atual*
*data_limite*
`;
    },
});
(0, commandManager_1.addCommand)({
    name: '6',
    description: '\u{1F4F1}Digite \u{0034}\u{FE0F}\u{20E3} para cadastrar um *cartão*',
    execute: () => {
        globalState.setClientCondition("cartao");
        return `\u{1F4B6}Para cadastrar um cartão, digite ou fale os detalhes:
*Nome da cartão*
*Tipo débito ou crédito* 
*Banco*
*Limite total*
*Limite disponível*`;
    },
});
(0, commandManager_1.addCommand)({
    name: '7',
    description: '\u{1F3E6}Digite \u{0035}\u{FE0F}\u{20E3} para cadastrar uma *conta bancária*',
    execute: () => {
        globalState.setClientCondition("conta");
        return `\u{1F4B6}Para cadastrar uma conta bancária, digite ou fale os detalhes:
*Nome da conta*
*Tipo*
*Banco*
*Saldo*
`;
    },
});
(0, commandManager_1.addCommand)({
    name: '8',
    description: '\u{2600}Digite \u{0038}\u{FE0F}\u{20E3} para Exibir *operações disponíveis*',
    execute: () => {
        return (0, commandManager_1.listCommands)().map(command => `${command.description}`).join('\n \n');
    },
});
(0, commandManager_1.addCommand)({
    name: '9',
    description: ' \u{1F525}Digite \u{0039}\u{FE0F}\u{20E3} para *Sair*',
    execute: () => '\u{1F60A} Obrigado, sigo a disposição'
});
