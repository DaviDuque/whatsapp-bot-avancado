// src/infra/global/GlobalState.ts
export class GlobalState {
  private static instance: GlobalState;

  public whatsappConnected: boolean = false;
  public clientId: string | null = null;  // Armazena o ID do cliente
  public clientMenuOption: string | null = null;  // Armazena a escolha do menu do cliente
  public mensagem: string | null = null; //armazena retorno do whatsapp
  public clientCondition: string | null = null;  // Armazena o ponto do cliente

  private constructor() {}

  public static getInstance(): GlobalState {
    if (!GlobalState.instance) {
      GlobalState.instance = new GlobalState();
    }
    return GlobalState.instance;
  }

  // Métodos para manipular o estado
  public setClientId(id: string) {
    this.clientId = id;
  }

  public getClientId(): string | null {
    return this.clientId;
  }

  public setClientMenuOption(option: string) {
    this.clientMenuOption = option;
  }

  public getClientMenuOption(): string | null {
    return this.clientMenuOption;
  }

  public setMensagem(mensagem: any) {
    this.mensagem = mensagem;
  }

  public getMensagem(): string | null {
    return this.mensagem;
  }

  public setClientCondition(condition: string) {
    this.clientCondition = condition;
  }

  public getClientCondition(): string | null {
    return this.clientCondition;
  }
}
