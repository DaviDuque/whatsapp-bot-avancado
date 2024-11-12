//clientes.controller.ts - cadstra cliente via whatsapp
import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import { buscarClientes } from './clientes.repository';



export class RelatorioClientes {
    buscar = async (req: Request, res: Response) => {
        const cliente = await buscarClientes();
       
        return res.status(200).json(cliente);
    }
}
        