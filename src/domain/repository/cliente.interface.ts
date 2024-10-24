import { Cliente } from "../entities/cliente";

export interface ClienteRepositoryInterface {
    add(cliente: Cliente): Promise<void>;
    update(cliente: string, updateCliente: Cliente): Promise<void>;   
}

