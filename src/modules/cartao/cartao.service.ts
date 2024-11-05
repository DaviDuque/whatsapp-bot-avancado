import { cadastrarCartao } from './cartao.repository';

export const cadastrarCartaoController = async (id_cliente: string, nome_cartao: string, tipo: string, banco: string, limite?: number, saldo?: number) => {
    try {
        await cadastrarCartao(id_cliente, nome_cartao, tipo, banco, limite, saldo);
    } catch (error) {
        return error;
    }
}