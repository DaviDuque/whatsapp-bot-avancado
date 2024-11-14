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
    return commandList.find(Command => Command.name === name);
}

export const listCommands = (): Command[] => {
    return commandList;
}

export const menuCommand = (Command: Command) => {
    commandList.push(Command);
}

