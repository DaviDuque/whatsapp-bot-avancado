import { cadastrarConta } from './conta.repository';

export const cadastrarContaController = async (id_cliente: string, nome_conta: string, tipo: string, banco: string, limite?: number, saldo?: number) => {
    try {
        await cadastrarConta(id_cliente, nome_conta, tipo, banco, limite, saldo);
    } catch (error) {
        return error;
    }
}