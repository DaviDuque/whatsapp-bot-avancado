export const formatDateToYYYYMMDD = (dateStr: string): string | null => {
  // Regex para validar os formatos DD/MM/YYYY e DD-MM-YYYY
  const regex = /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/;
  const match = dateStr.match(regex);

  if (match) {
    const day = match[1];
    const month = match[2];
    const year = match[3];

    // Criar uma nova data usando o formato YYYY-MM-DD
    const formattedDate = `${year}-${month}-${day}`;

    // Verificar se a data é válida (verifica se os valores são coerentes)
    const parsedDate = new Date(formattedDate);
    if (
      !isNaN(parsedDate.getTime()) &&
      parsedDate.getUTCFullYear() === +year &&
      parsedDate.getUTCMonth() + 1 === +month &&
      parsedDate.getUTCDate() === +day
    ) {
      return formattedDate; // Retorna no formato YYYY-MM-DD
    }
  }

  return null; // Retorna null se a data não for válida
};

// Exemplo de uso:
const dataDespesa1 = '10/10/2024';
const dataDespesa2 = '10-10-2024';

console.log(formatDateToYYYYMMDD(dataDespesa1)); // '2024-10-10'
console.log(formatDateToYYYYMMDD(dataDespesa2)); // '2024-10-10'
