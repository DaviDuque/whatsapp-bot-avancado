import { cadastrarMeta } from './metas.repository';

export const cadastrarMetaController = async (id_cliente: string, descricao: string, valor_objetivo: number, valor_atual: number, data_limite: string) => {
    try {
        await cadastrarMeta(id_cliente, descricao, valor_objetivo, valor_atual, data_limite);
    } catch (error) {
        return error;
    }
}




