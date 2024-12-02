import { connection } from '../../infra/database/mysql-connection';
import dayjs from 'dayjs';

export const TransacoesService = {
    // Criar pagamento avulso
    async criarPagamentoAvulso(dados: any) {
        const operacoes = await connection.getConnection();
        try {
            await operacoes.beginTransaction();

            // Salvar a transação
            const [result]: any = await operacoes.query(
                `INSERT INTO transacoes (id_cliente, id_produto, id_tipo, meio_pagamento, valor, valor_pago, valor_total, data_pagamento)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    dados.id_cliente,
                    dados.id_produto,
                    1, // Tipo: Pagamento avulso
                    dados.meio_pagamento,
                    dados.valor,
                    dados.valor_pago,
                    dados.valor_total,
                    new Date(),
                ]
            );

            // Atualizar o status do cliente para "Ativo"
            await operacoes.query(`UPDATE clientes SET status = 2 WHERE id_cliente = ?`, [
                dados.id_cliente,
            ]);

            await operacoes.commit();

            return { id_transacao: result.insertId, ...dados };
        } catch (error: any) {
            await operacoes.rollback();
            throw new Error('Erro ao salvar pagamento avulso: ' + error.message);
        } finally {
            operacoes.release();
        }
    },

    // Criar assinatura
    async criarAssinatura(dados: any) {
        const operacoes = await connection.getConnection();
        try {
            await operacoes.beginTransaction();

            // Salvar a transação
            const [result]: any = await operacoes.query(
                `INSERT INTO transacoes (id_cliente, id_produto, id_tipo, meio_pagamento, 
                valor, valor_pago, valor_total, frequencia, frequencia_tipo, data_inicio, 
                data_fim, id_transacao_gateway, id_pagador_gateway, id_loja_gateway, id_aplicacao_gateway)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    dados.id_cliente,
                    dados.id_produto,
                    2, // Tipo: Assinatura
                    dados.meio_pagamento,
                    dados.valor,
                    dados.valor_pago,
                    dados.valor_total,
                    dados.frequencia,
                    dados.frequencia_tipo,
                    dayjs(dados.data_inicio.replace(/["'\[\]\(\)]/g, '')).format('YYYY-MM-DD'),
                    dayjs(dados.data_fim.replace(/["'\[\]\(\)]/g, '')).format('YYYY-MM-DD'),
                    dados.id_transacao_gateway,
                    dados.id_pagador_gateway,
                    dados.id_loja_gateway,
                    dados.id_aplicacao_gateway
                ]
            );

            // Atualizar o status do cliente para "Ativo"
            await operacoes.query(`UPDATE clientes SET status = 3 WHERE id_cliente = ?`, [
                dados.id_cliente,
            ]);

            await operacoes.commit();

            return { id_transacao: result.insertId, ...dados };
        } catch (error: any) {
            await operacoes.rollback();
            throw new Error('Erro ao salvar assinatura: ' + error.message);
        } finally {
            operacoes.release();
        }
    },

    // Atualizar assinatura
    async atualizarAssinatura(id_transacao: number, dados: any) {
        const [result] = await connection.query(
            `UPDATE transacoes SET frequencia = ?, frequencia_tipo = ?, data_fim = ? WHERE id_transacao = ?`,
            [dados.frequencia, dados.frequencia_tipo, dados.data_fim, id_transacao]
        );

        return { id_transacao, ...dados };
    },

    // Atualizar status assinatura
    async atualizarStatusAssinatura(id_transacao: number, dados: any) {
        console.log("dados", dados.status, id_transacao);
        const [result] = await connection.query(
            `UPDATE transacoes SET status = ? WHERE id_transacao = ?`,
            [dados, id_transacao]
        );

        return { id_transacao, ...dados };
    },

    // Atualizar pagamento
    async atualizarPagamento(id_transacao: number, dados: any) {
        const [result] = await connection.query(
            `UPDATE transacoes SET valor_pago = ?, data_pagamento = ? WHERE id_transacao = ?`,
            [dados.valor_pago, new Date(), id_transacao]
        );

        return { id_transacao, ...dados };
    },

    // Cancelar pagamento
    async cancelarPagamento(id_transacao: number) {
        const operacoes = await connection.getConnection();
        try {
            await operacoes.beginTransaction();

            // Atualizar o status do cliente para "Pendente"
            const [transacao]: any = await operacoes.query(
                `SELECT id_cliente FROM transacoes WHERE id_transacao = ?`,
                [id_transacao]
            );

            if (!transacao[0]) {
                throw new Error('Transação não encontrada');
            }

            await connection.query(`UPDATE clientes SET status = 3 WHERE id_cliente = ?`, [
                transacao[0].id_cliente,
            ]);

            // Cancelar a transação
            await operacoes.query(
                `UPDATE transacoes SET valor_pago = 0, data_pagamento = NULL WHERE id_transacao = ?`,
                [id_transacao]
            );

            await operacoes.commit();

            return { id_transacao, status: 'Cancelado' };
        } catch (error: any) {
            await operacoes.rollback();
            throw new Error('Erro ao cancelar pagamento: ' + error.message);
        } finally {
            operacoes.release();
        }
    },
};
