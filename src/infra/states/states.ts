
const estados: { [telefone: string]: string } = {}; // Armazenar o estado temporário
const clientes:  { [id_cliente: string]: string } = {}; // Armazenar o cliente estado 


export const verificarEstado = (telefone: string): string | undefined => {
    return estados[telefone];
};

export const atualizarEstado = (telefone: string, estado: string): void => {
    estados[telefone] = estado;
};

export const limparEstado = (telefone: string): void => {
    delete estados[telefone];
};

export const verificarClienteEstado = (id_cliente: string): string | undefined => {
    return clientes[id_cliente] = id_cliente;
};


export const atualizarClienteEstado = (id_cliente: string): void => {
    clientes[id_cliente] = id_cliente;
console.log("clientes state--->", clientes[id_cliente]);
};

