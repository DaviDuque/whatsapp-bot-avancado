import { Request, Response } from 'express';
import path from 'path';
import { sendFileViaWhatsApp } from '../../infra/integrations/twilio';
import { error } from 'console';

// Controller para servir o arquivo
/*export const getFile = (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '..', 'bucket', filename);
  console.log(">>>>>>>>>>>>>erro filepath", filePath);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.log(">>>>>>>>>>>>>erro de srq", err);
      res.status(404).json({ message: 'Arquivo não encontrado.' });
    }
  });
};*/

export const getFile = (req: Request, res: Response) => {
  const { filename } = req.params;

  // Ajusta o caminho para a nova localização da pasta bucket na raiz do projeto
  const filePath = path.join(process.cwd(), 'bucket', filename); 

  console.log(">>>>>>>>>>>>>Caminho do arquivo:", filePath);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.log(">>>>>>>>>>>>>Erro ao enviar arquivo:", err);
      res.status(404).json({ message: 'Arquivo não encontrado.' });
    }
  });
};

// Controller para enviar o arquivo via WhatsApp
export const sendWhatsAppFile = async (req: Request, res: Response) => {
  const { to, from } = req.body; // Número do destinatário (ex.: whatsapp:+123456789)

  try {
    const messageSid = await sendFileViaWhatsApp(to, from, 'arquivo.xlsx');
    res.status(200).json({ message: 'Arquivo enviado com sucesso!', sid: messageSid });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao enviar arquivo.', error: error });
  }
};
