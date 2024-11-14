"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuCommand = exports.listCommands = exports.getCommand = exports.addCommand = void 0;
const commandList = [];
const addCommand = (Command) => {
    commandList.push(Command);
};
exports.addCommand = addCommand;
const getCommand = (name) => {
    return commandList.find(Command => Command.name === name);
};
exports.getCommand = getCommand;
const listCommands = () => {
    return commandList;
};
exports.listCommands = listCommands;
const menuCommand = (Command) => {
    commandList.push(Command);
};
exports.menuCommand = menuCommand;
