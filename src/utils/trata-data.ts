export const formatDateToYYYYMMDD = (dateStr: string): string | null => {
    // Regex para validar o formato DD/MM/YYYY
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(regex);
  
    if (match) {
      const day = match[1];
      const month = match[2];
      const year = match[3];
  
      // Criar uma nova data usando o formato YYYY-MM-DD
      const formattedDate = `${year}-${month}-${day}`;
  
      // Verificar se a data é válida
      const parsedDate = new Date(formattedDate);
      if (!isNaN(parsedDate.getTime())) {
        return formattedDate; // Retorna no formato YYYY-MM-DD
      }
    }
  
    return null; // Retorna null se a data não for válida
  }
  
  // Exemplo de uso:
  const dataDespesa = '10/10/2024';
  const resultado = formatDateToYYYYMMDD(dataDespesa);
  
  if (resultado) {
    console.log('Data válida e formatada:', resultado);
  } else {
    console.log('Data inválida');
  }
  