const dataAtual = new Date();
const dia = dataAtual.getDate(); // Dia do mês
const mes = dataAtual.getMonth() + 1; // Mês (0-11, então adicionamos 1)
const ano = dataAtual.getFullYear(); // Ano completo
const dataCompleta = `${ano}-${mes}-${dia}`
export const receitas = `Receitas

Dado o texto abaixo feito pelo autor "X", extraia um array contendo apenas os dados objetivados para informar uma receita ou entrada de capital do autor "X". Cada item no array deve ser representado por uma string ou valor numérico conforme os dados apresentados no texto. O formato de saída deve ser um array com os dados ordenados.

Dados objetivados:
Nome da receita,
Valor da receita,
Data da receita,
Categoria da receita.

Ordem dos dados:
1-Nome da receita -> string.

2-Valor da receita -> float: 10,00.

3-Data da receita -> date:YYYY-MM-DD e se data for "hoje" ou "atual" retorne ${dataCompleta}.

4-Categoria da receita -> string, localize em qual das opções melhor se encaixa, mesmo que não contenha diretamente no texto, podendo ser:

Imóveis = toda e qualquer receita referente a imóveis, a venda de imoveis, a alugueis e a arrendamentos.
Salário = Tudo e qualquer receita referente a recebimentos de salários, pagamentos e bonificações do trabalho.
Rendimentos = Tudo e qualquer receita referente ao recebimento de rendimentos financeiros de lucro, de dividendos, juros de retorno de investimentos.
Ações = Tudo e qualquer receita referente ao mercado de ações, lucro de ações, vendas de ações, dividendos.
Renda extra = Tudo e qualquer receita referente a renda extra, pequenos trabalhos informais, trabalho não principal, trabalho esporádico.
Vendas = Tudo e qualquer receita referente a venda de produtos ou parte do patrimonio.
Pensão = Tudo e qualquer receita referente a pensões.
Herança = Tudo e qualquer receita referente ao recebimento de herança.
Previdência = Tudo e qualquer receita referente ao recebimento de aposentadoria, previdência pública e previdência privada.
Cartão bh bus = Tudo e qualquer receita referente ao recebimento de cartão de transporte público.
Vale alimentação = Tudo e qualquer receita referente ao recebimento de Ticket alimentação.
Vale refeição = Tudo e qualquer receita referente ao recebimento de Ticket refeição.

Regras de formação do array: 
1-deve ter o formato:  [<receita>, <valor>, <data>, <categoria>]
2-Caso não seja identificado no texto algum item do array retorne null para qualquer um deles em sua devida posição no array.
3-Os dados podem vir desestruturados e fora de ordem. Retorne apenas o array e ordenado.

Texto de entrada: `;