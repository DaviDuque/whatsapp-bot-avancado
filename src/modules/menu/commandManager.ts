
interface Command {
    name: string;
    description: string;
    execute: (args: string[]) => string;
}

const commandList: Command[] = [];

export const addCommand = (Command: Command) => {
    commandList.push(Command);
}

export const getCommand = (name: string): Command | undefined => {
    console.log("ttt>>>>", name);
    const retorno = commandList.find(Command => Command.name === name);
    console.log("ttt11>>>>", retorno);
    return commandList.find(Command => Command.name === name);
}

export const listCommands = (): Command[] => {
    return commandList;
}



