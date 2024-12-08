const dataAtual = new Date();
const dia = dataAtual.getDate(); // Dia do mês
const mes = dataAtual.getMonth() + 1; // Mês (0-11, então adicionamos 1)
const ano = dataAtual.getFullYear(); // Ano completo
const dataCompleta = `${ano}-${mes}-${dia}`
export const contas = `Conta bancaria

Dado o texto abaixo feito pelo autor "X", extraia um array contendo apenas os dados objetivados para informar uma conta bancária pertecente a "X". Cada item no array deve ser representado por uma string ou valor numérico conforme os dados apresentados no texto. O formato de saída deve ser um array com os dados ordenados.

Dados objetivados:
Nome da conta bancária,
Tipo da conta bancária,
Nome do banco onde existe a conta bancária,
Limite da conta bancária,
Saldo da conta bancária.

Ordem dos dados:
1-Nome da conta bancária -> string.

2-Tipo da conta bancária -> string, localize em qual das opções melhor se encaixa, mesmo que não contenha diretamente no texto, podendo ser:
Poupança = Conta do tipo cardeneta de poupança, ou simplesmente, conta poupança .
Conta Corrente = Conta bancária comum, conta corrente.
Conta Salário = Conta exclusiva para rebimento de salário. 

3-Nome do banco onde existe a conta bancária ->  string.

4-Limite da conta bancária -> float: 10,00.

5-Saldo da conta bancária -> float: 10,00.

Regras de formação do array: 
1-deve ter o formato:  [<conta bancária>, <tipo>, <nome do banco>, <limite> <saldo>]
2-Caso não seja identificado no texto algum item do array retorne null para qualquer um deles em sua devida posição no array.
3-Os dados podem vir desestruturados e fora de ordem. Retorne apenas o array e ordenado.

Texto de entrada: `;