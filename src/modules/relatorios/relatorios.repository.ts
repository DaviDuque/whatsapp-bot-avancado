import { connection } from '../../infra/database/mysql-connection';
import { promises as fs } from 'fs';
import path from 'path';


const dataAtual = new Date();
const dia = dataAtual.getDate(); // Dia do mês
const mes = dataAtual.getMonth() + 1; // Mês (0-11, então adicionamos 1)
const ano = dataAtual.getFullYear(); // Ano completo
const dataCompleta = `${ano}-${mes}-${dia}`



export async function saveReportToDatabase(id_cliente: number, reportType: string, periodo_inicio: string, periodo_fim: string, reportContent: string, ): Promise<void> {
    await connection.query(
        `INSERT INTO relatorios (id_cliente, tipo, periodo_inicio, periodo_fim, data_geracao, relatorio) VALUES (?, ?, ?, ?, ?, ?)`,
        [id_cliente, reportType, periodo_inicio, periodo_fim, dataCompleta, reportContent]
    );
}

// Função para gerar o arquivo CSV e salvá-lo no diretório especificado
export async function generateCSVFile(csvContent: string, fileName: string): Promise<string> {
    const bucketDir = path.resolve(__dirname, '../../bucket');
    const filePath = path.join(bucketDir, `${fileName}.csv`);

    // Certifique-se de que o diretório existe; se não, crie-o
    await fs.mkdir(bucketDir, { recursive: true });

    // Salva o conteúdo do CSV no arquivo
    await fs.writeFile(filePath, csvContent, 'utf8');

    console.log(`Arquivo CSV gerado e salvo em: ${filePath}`);
    return filePath;
}
