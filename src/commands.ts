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
    description: 'Digite 1 para entrar com gastos e despesas \u{1F648}',
    execute: () => {
        globalState.setClientCondition("despesas");
        return '\u{1F44D} Para cadastrar uma despesa, envie os detalhes como: nome da despesa, data, dia, categoria, se é parcelado, onde foi';
    },
});

/*addCommand({
    name: '1',
    description: 'Digite 1 para \u{1F648} Entrada de gastos',
    execute: () => 'Ainda não consigo processar essa requisição, mas estamos trabalhando nisso ;) \n \u{2600} Digite 8 para voltar ao menu. \n \u{1F525} Digite 9 para sair.'
});*/

addCommand({
    name: '2',
    description: 'Digite 2 para \u{1F60D} Entrada de receita',
    execute: () => {
        globalState.setClientCondition("receitas");
        return '\u{1F44D} Para cadastrar uma receita, envie os detalhes como: nome da receita, data, dia, categoria';
    },
});

addCommand({
    name: '3',
    description: 'Digite 3 para \u{1F60D} Entrada de investimentos',
    execute: () => {
        globalState.setClientCondition("investimentos");
        return '\u{1F44D} Para cadastrar uma investimento, envie os detalhes como: nome da investimento, data, dia, categoria';
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
    description: 'Digite 8 para  \u{2600} Exibe operações disponíveis',
    execute: () => {
        return listCommands().map(
            command => `${command.name}:${command.description}`
        ).join('\n \n');
    },
});

addCommand({
    name: '9',
    description: 'Digite 9 para  \u{1F525} Sair',
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