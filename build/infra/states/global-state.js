"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalState = void 0;
// src/infra/global/GlobalState.ts
class GlobalState {
    constructor() {
        this.whatsappConnected = false;
        this.clientId = null; // Armazena o ID do cliente
        this.clientMenuOption = null; // Armazena a escolha do menu do cliente
        this.mensagem = null; //armazena retorno do whatsapp
        this.clientCondition = null; // Armazena o ponto do cliente
    }
    static getInstance() {
        if (!GlobalState.instance) {
            GlobalState.instance = new GlobalState();
        }
        return GlobalState.instance;
    }
    // Métodos para manipular o estado
    setClientId(id) {
        this.clientId = id;
    }
    getClientId() {
        return this.clientId;
    }
    setClientMenuOption(option) {
        this.clientMenuOption = option;
    }
    getClientMenuOption() {
        return this.clientMenuOption;
    }
    setMensagem(mensagem) {
        this.mensagem = mensagem;
    }
    getMensagem() {
        return this.mensagem;
    }
    setClientCondition(condition) {
        this.clientCondition = condition;
    }
    getClientCondition() {
        return this.clientCondition;
    }
}
exports.GlobalState = GlobalState;
