import { ListarDespesaPorCliente } from '../despesas/despesas.repository';
import { ListarReceitasPorCliente } from '../receitas/receitas.repository';
import  { ListarInvestimentosPorCliente } from '../investimentos/investimentos.repository';



export const ListarDespesaPorClienteControler = async (id_cliente: string, startDate: string, endDate: string) => {
    try {
        return await ListarDespesaPorCliente(id_cliente, startDate, endDate);
    } catch (error) {
        return error;
    }
}


export const ListarReceitasPorClienteControler = async (id_cliente: string, startDate: string, endDate: string) => {
    try {
        return await ListarReceitasPorCliente(id_cliente, startDate, endDate);
    } catch (error) {
        return error;
    }
}

export const ListarInvestimentosPorClienteControler = async (id_cliente: string, startDate: string, endDate: string) => {
    try {
        return await ListarInvestimentosPorCliente(id_cliente, startDate, endDate);
    } catch (error) {
        return error;
    }
}



