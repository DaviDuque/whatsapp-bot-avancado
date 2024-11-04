import { cadastrarDespesa } from './despesas.repository';

export const cadastrarDespesaController = async (id_cliente: string, descricao: string, valor: number, data_despesa: string, categoria?: string, parcelado?: string) => {
    try {
        await cadastrarDespesa(id_cliente, descricao, valor, data_despesa, categoria, parcelado);
    } catch (error) {
        return error;
    }
    
};
