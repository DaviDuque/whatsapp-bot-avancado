export const formatToBRL = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};



export const formatWithRegex = (value: number) => {
    // Garante que o valor é uma string
    const stringValue = value.toString();
    
    // Adiciona ",00" se não houver ponto decimal, ou substitui o ponto por uma vírgula
    const formattedValue = stringValue.includes(".") 
        ? stringValue.replace(".", ",") 
        : stringValue + ",00";
    
    // Adiciona "R$" no início
    return "R$" + formattedValue;
};