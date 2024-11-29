import { connection } from '../../infra/database/mysql-connection';
import { MercadoPagoConfig, Preference, PreApproval } from "mercadopago";


export const cadastrarPagamento = async (
    id_cliente: string,
    descricao: string,
    valor_objetivo: number,
    valor_atual: number,
    data_limite: string): Promise<{ sucesso: boolean; mensagem: string }> => {
    try {
        const query = 'INSERT INTO pagamentos (id_cliente, descricao, valor_objetivo, valor_atual, data_limite) VALUES (?, ?, ?, ?, ?)';
        const values = [
            id_cliente,
            descricao.trim(),
            valor_objetivo,
            valor_atual,
            data_limite.trim(),
        ];
        await connection.execute(query, values);
        return { sucesso: true, mensagem: 'Meta cadastrado com sucesso.' };
    } catch (error) {
        console.error('Erro ao cadastrar cartão:', error);
        return { sucesso: false, mensagem: `Erro ao cadastrar meta: ${error}` };
    }
};




export const processaPagamento = async (
    id: string, // Identificador único do item
    title: string, // Nome do item
    unit_price: number, // Preço unitário
    quantity: number, // Quantidade

) => {
    const client = new MercadoPagoConfig({
        accessToken: `${process.env.ACCESS_TOKEN_MERCADO_PAGO}`, // Substitua pelo seu Access Token do Mercado Pago
    });


    const preference = new Preference(client);

    try {


        // Validação básica dos campos
        if (!id || !title || !unit_price || !quantity) {
            return { status: 'error', error: "Missing required fields" };
        }

        const body = {
            items: [
                {
                    id: id, // Identificador único do item
                    title: title, // Nome do item
                    unit_price: unit_price, // Preço unitário
                    quantity: quantity, // Quantidade
                },
            ],
            back_urls: {
                success: "https://www.seusite.com/success", // URL em caso de sucesso
                failure: "https://www.seusite.com/failure", // URL em caso de falha
                pending: "https://www.seusite.com/pending", // URL para pendente
            },
            auto_return: "approved", // Retorno automático ao sucesso
            notification_url: "https://seusite.com/webhook"

        };

        // Criação do link de pagamento
        const response = await preference.create({ body });

        // Retorna o link gerado
        console.log("response.....", response);
        return {
            status: 'sucesso',
            init_point: response, // URL do link de pagamento
        };
    } catch (error) {
        console.error("error", error);
        return { status: 'error', error: "Failed to create payment link" };
    }
}


export const processaAssinatura = async (
    payer_email: string,
    reason: string,
    amount: number,
    frequency: number,
    frequency_type: string,
    start_date: string,
    end_date: string,
    back_url: string
) => {
    const client = new MercadoPagoConfig({
        accessToken: `${process.env.ACCESS_TOKEN_MERCADO_PAGO}`, // Substitua pelo seu Access Token do Mercado Pago
    });

    const preapproval = new PreApproval(client);
    try {

        if (!payer_email || !reason || !amount || !frequency || !frequency_type || !start_date || !end_date || !back_url) {
            return { error: "Missing required fields" };
        }

        const response = await preapproval.create({
            body: {
                payer_email,
                reason,
                auto_recurring: {
                    frequency,
                    frequency_type,
                    transaction_amount: amount,
                    currency_id: "BRL",
                    start_date,
                    end_date
                },
                back_url,
                //notification_url: "https://seusite.com/webhook"

            },
        });

        response.status = "sucesso";
        console.log("service", response)
        return response;
    } catch (error) {
        console.log("erro", error);
        return { status: 'error', error: "Erro ao criar assinatura", details: error };
    }

}







