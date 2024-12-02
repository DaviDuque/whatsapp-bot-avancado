//clientes.service.ts
import { verificarClientePorTelefone, cadastrarCliente, Cliente } from './clientes.repository';
import {  formatarNumeroTelefone } from '../../utils/trata-telefone';
import { Request, Response } from 'express';

export const processarCliente = async (cliente: Cliente): Promise<string> => {
    try {
        const clienteExiste = await verificarClientePorTelefone(formatarNumeroTelefone(cliente.telefone.replace(/^whatsapp:/, '')));
        if (clienteExiste) {
            return 'Cliente já cadastrado.';
        } else {
            await cadastrarCliente(cliente);
            return 'Cliente cadastrado com sucesso.';
        }
    } catch (error) {
        console.error('Erro ao processar o cliente:', error);
        throw new Error('Falha ao processar o cliente. Tente novamente mais tarde.');
    }
};



export const cadastrarClientePainelController = async (req: Request, res: Response) => {
    const cliente = req.body;
    try {
        const resultado = await processarCliente(cliente);
        res.status(200).json({ message: resultado });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar cliente.', error });
    }
};


export const cadastrarClienteController = async (cliente:any) => {
    try {
        const resultado = await processarCliente(cliente);
        return resultado;
    } catch (error) {
        return({ message: 'Erro ao processar cliente.', error });
    }
};




