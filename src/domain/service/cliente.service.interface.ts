export default interface ClienteServiceInterface {
    cliente(id_cliente: string): Promise<string>;
}