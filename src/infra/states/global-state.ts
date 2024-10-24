// src/infra/global/GlobalState.ts
export class GlobalState {
    private static instance: GlobalState;
    
    public whatsappConnected: boolean = false;
    public clientId: string | null = null;  // Armazenará o ID do cliente
  
    private constructor() {}
  
    public static getInstance(): GlobalState {
      if (!GlobalState.instance) {
        GlobalState.instance = new GlobalState();
      }
      return GlobalState.instance;
    }
  
    public setClientId(id: string) {
      this.clientId = id;
    }
  
    public getClientId(): string | null {
      return this.clientId;
    }
  }
  