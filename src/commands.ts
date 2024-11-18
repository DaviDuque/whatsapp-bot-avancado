import { addCommand, listCommands } from "./commandManager";
import { GlobalState } from './infra/states/global-state';

const globalState = GlobalState.getInstance();
const cliente = globalState.getClientId();

addCommand({
    name: '',
    description: '\u{1F44B} Escolha uma opção abaixo \u{1F4BB}',
    execute: () => 'Ainda não consigo processar essa requisição, mas estamos trabalhando nisso ;) \n \u{2600} Digite 1 para voltar ao menu. \n \u{1F525} Digite 2 para sair.'
});

addCommand({
    name: '1',
    description: '\u{1F648}Digite \u{0031}\u{FE0F}\u{20E3} para entrar com *gastos e despesas* ',
    execute: () => {
        globalState.setClientCondition("despesas");
        return `\u{1F44D} Para cadastrar uma despesa, digite ou fale os detalhes: 
*Nome da despesa*
*data* 
*Valor*
*dia*
*Parcelado?* S/N`;
    },
});

/*addCommand({
    name: '1',
    description: 'Digite 1 para \u{1F648} Entrada de gastos',
    execute: () => 'Ainda não consigo processar essa requisição, mas estamos trabalhando nisso ;) \n \u{2600} Digite 8 para voltar ao menu. \n \u{1F525} Digite 9 para sair.'
});*/

addCommand({
    name: '2',
    description: '\u{1F60E}Digite \u{0032}\u{FE0F}\u{20E3} para Entrada de *receita*',
    execute: () => {
        globalState.setClientCondition("receitas");
        return '\u{1F44D} Para cadastrar uma receita, envie os detalhes como: nome da receita, data, dia, categoria';
    },
});

addCommand({
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


addCommand({
    name: '4',
    description: '\u{1F4F1}Digite \u{0034}\u{FE0F}\u{20E3} para cadastrar um *relatório*',
    execute: () => {
        globalState.setClientCondition("relatorio");
        return `Para buscar um relatório, digite ou fale os detalhes:
*Nome da cartão*
*tipo*
*banco*
*limite*
*saldo*
`;
    },
});

addCommand({
    name: '5',
    description: '\u{1F3E6}Digite \u{0035}\u{FE0F}\u{20E3} para cadastrar uma *Meta*',
    execute: () => {
        globalState.setClientCondition("meta");
        return `Para definir um meta, digite ou fale os detalhes:
                *Nome da meta*
                *valor_objetivo*
                *valor_atual*
                *data_limite*
`;
    },
});

addCommand({
    name: '6',
    description: '\u{1F4F1}Digite \u{0034}\u{FE0F}\u{20E3} para cadastrar um *cartão*',
    execute: () => {
        globalState.setClientCondition("cartao");
        return `Para cadastrar um cartão, digite ou fale os detalhes:
*Nome da cartão*
*tipo*
*banco*
*limite*
*saldo*
`;
    },
});

addCommand({
    name: '7',
    description: '\u{1F3E6}Digite \u{0035}\u{FE0F}\u{20E3} para cadastrar uma *conta bancária*',
    execute: () => {
        globalState.setClientCondition("conta");
        return `Para cadastrar uma conta bancária, digite ou fale os detalhes:
*Nome da cartão*
*tipo*
*banco*
*limite*
*saldo*
`;
    },
});

/*addCommand({
    name: '3',
    description: 'Digite 3 para \u{1F947} Resumo do dia',
    execute: () => 'Ainda não consigo processar essa requisição, mas estamos trabalhando nisso ;) \n \u{2600} Digite 8 para voltar ao menu. \n \u{1F525} Digite 9 para sair.'
});

addCommand({
    name: '4',
    description: 'Digite 4 para \u{1F3C6} Resumo do mês',
    execute: () => 'Ainda não consigo processar essa requisição, mas estamos trabalhando nisso ;) \n \u{2600} Digite 8 para voltar ao menu. \n \u{1F525} Digite 9 para sair.'
});*/


addCommand({
    name: '8',
    description: '\u{2600}Digite \u{0038}\u{FE0F}\u{20E3} para Exibir *operações disponíveis*',
    execute: () => {
        return listCommands().map(
            command => `${command.description}`
        ).join('\n \n');
    },
});

addCommand({
    name: '9',
    description: ' \u{1F525}Digite \u{0039}\u{FE0F}\u{20E3} para *Sair*',
    execute: () => '\u{1F60A} Obrigado, sigo a disposição'
});


/*addCommand({
    name: 'ping',
    description: 'Responde com "pong"',
    execute: () => 'pong'
});

addCommand({
    name: 'echo',
    description: 'Repete a Msg que foi enviada',
    execute: (args: string[]) => (args.join(' ')),
});

addCommand({
    name: 'help',
    description: 'Lista todos os comandos disponíveis',
    execute: () => {
        return listCommands().map(
            command => `${command.name}:${command.description}`
        ).join('\n');
    },
});*/