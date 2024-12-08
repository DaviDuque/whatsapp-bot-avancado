const dataAtual = new Date();
const dia = dataAtual.getDate(); // Dia do mês
const mes = dataAtual.getMonth() + 1; // Mês (0-11, então adicionamos 1)
const ano = dataAtual.getFullYear(); // Ano completo
const dataCompleta = `${ano}-${mes}-${dia}`
export const despesas = `Despesas

Dado o texto abaixo feito pelo autor "X", extraia um array contendo apenas os dados objetivados para informar uma despesa ou gasto do autor "X". Cada item no array deve ser representado por uma string ou valor numérico conforme os dados apresentados no texto. O formato de saída deve ser um array com os dados ordenados.

Texto de entrada:
"{INSIRA SEU TEXTO AQUI}"

Dados objetivados:
Nome da Despesa,
Valor da despesa,
Data da despesa,
Categoria da despesa,
Forma de pagamento.

Ordem dos dados:
1-Nome da Despesa -> string.

2-Valor da despesa -> float: 10,00.

3-Data da despesa -> date:YYYY-MM-DD e se data for "hoje" ou "atual" retorne ${dataCompleta}.

4-Categoria da despesa -> string, localize em qual das opções melhor se encaixa, mesmo que não contenha diretamente no texto, podendo ser
Moradia = toda e qualquer despesa referente a imoveis, aluguel, e gastos com moradia.
Alimentação = Tudo e qualquer despesa referente a mercado, lanches, açougue, sacolão, restaurante, lanchonete e alimentação.
Saúde = Tudo e qualquer despesa referente a cuidados com a saúde, medico, hopitais, remédios, tratamentos médicos.
Transporte = Tudo e qualquer despesa referente a transporte, passagens, combustíveis, manutenção de veicúlo, aplicativo de mobilidade, transporte público, viajens a trabalho.
Despesas pessoais = Tudo e qualquer despesa referente a a gastos pessoais.
Lazer = Tudo e qualquer despesa referente a diversão e lazer, passeios, viagens de turismo, parques, eventos, shows, esporte, teatro, cinema, shopping, feiras.
Doações = Tudo e qualquer despesa referente a doações, caridade, ajuda.
Tarifas/taxas/impostos = Tudo e qualquer despesa referente a pagamento de impostos, taxas, tarifas do governo, tarifa de serviços públicos.
Despesas esporádicas = Tudo e qualquer despesa referente a gastos diversos e não mapeado.
Dividas = Tudo e qualquer despesa referente a pagamento de dívidas.

5-Forma de pagamento-> string, podendo ser Crédito parcelado, Crédito a vista, Débito, PIX.


Regras de formação do array: 
1-deve ter o formato: [<Despesa/gasto>, <valor>, <data da despesa>, <categaria>, <metodo_pagamento>]
2-Caso não seja identificado no texto algum item do array retorne null para qualquer um deles em sua devida posição no array.
3-Os dados podem vir desestruturados e fora de ordem. Retorne apenas o array e ordenado.`;