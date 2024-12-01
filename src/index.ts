//index para cadastro

import * as dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Auth } from './infra/auth/auth';
import { authMiddleware } from './infra/auth/auth.middleware';
import { Clientes } from './modules/clientes/clientes.controller';
import { RelatorioClientes } from './modules/clientes/relatorio-clientes.controller';
import { Despesas } from './modules/despesas/despesas.controller';
import { Receitas } from './modules/receitas/receitas.controller';
import { Investimentos } from './modules/investimentos/investimentos.controller';
import { Cartao } from './modules/cartao/cartao.controller';
import { Conta } from './modules/conta/conta.controller';
import { verificarClientePorTelefone, criarClientePorTelefone, buscarClientePorTelefone } from './modules/clientes/clientes.repository';
import { AudioService } from './infra/integrations/audio.service';
import { SummarizeServiceDespesas } from './infra/integrations/summarize.service';
import { GlobalState } from './infra/states/global-state';
import { getCommand } from './commandManager';
import { sendMessage, sendListPickerMessage } from './infra/integrations/twilio';
import { Relatorios } from './modules/relatorios/extrair-relatorios.controller';
import { RelatoriosSimples } from './modules/relatorios/relatorios-simples.controller';
import { RelatoriosTotal } from './modules/relatorios/relatorios-total.controller';
import { Pagamentos } from './modules/pagamentos/pagamentos.controller';
import { getFile, sendWhatsAppFile } from './modules/arquivos/arquivos.controller';
import { Meta } from './modules/metas/metas.controller';
import transacoesRoutes from './routers/transacoes.routes';
import cors from 'cors';
//import { MercadoPagoConfig, Preference } from "mercadopago";
import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { formatarNumeroTelefone } from './utils/trata-telefone';



const app = express();
const port = process.env.PORT || '3333';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: '*', // Substitua pelo URL do seu frontend
    methods: 'GET,POST,PUT,DELETE', // Métodos permitidos
    allowedHeaders: 'Content-Type, Authorization' // Cabeçalhos permitidos
}));


const newCliente = new Clientes();
const newRelatorioClientes = new RelatorioClientes;
const newDespesas = new Despesas();
const newReceitas = new Receitas();
const newInvestimentos = new Investimentos();
const NewCartao = new Cartao();
const NewConta = new Conta();
const globalState = GlobalState.getInstance();
const authUsercase = new Auth();
const newRelatorio = new Relatorios();
const newRelatorioSimples = new RelatoriosSimples();
const newRelatorioTotal = new RelatoriosTotal();
const newMeta = new Meta();
const newPagamento = new Pagamentos();


app.get('/', (req: Request, res: Response) => {
    res.send('API ON');
});

app.post('/login', authUsercase.login);
app.post('/register', authMiddleware, authUsercase.register);
//modulo cliente não finalizado cadastro de cliente via API
app.use('/clientes', newCliente.cadastrarCliente);
app.post('/refresh-token', authUsercase.refreshToken);
app.post('/relatorio-simples', newRelatorioSimples.RelatorioSimples);
app.post('/relatorio-total', newRelatorioTotal.RelatorioTotal);

app.get('/relatorio-clientes', newRelatorioClientes.buscar);
app.get('/user/:id_usuario', authUsercase.user);

app.get('/file/:filename', getFile); // Endpoint para servir o arquivo
app.post('/send-whatsapp', sendWhatsAppFile);


app.use('/transacoes', transacoesRoutes);



app.get('/download', async (req: Request, res: Response) => {
    try {
        const serviceAudio = new AudioService();

        const url = process.env.AUDIO_OGG_FILE_PATH;

        if (url == undefined) {
            res.status(400).send('url não informada')
            return;
        }
        const response = await serviceAudio.download(url);
        res.json({ url: response });
    } catch (error) {
        console.log(';;;;', error);
        res.status(500).send(error);
    }
});



app.post('/whatsapp', async (req: Request, res: Response) => {
    const { From, To, Body } = req.body;
    console.log("reqbody>>>", Body);
    //if(!Body) return undefined;
    const [commandName, ...args] = Body.split(' ');
    console.log("req...........", req.body);

    // Verificar se o cliente já está cadastrado
    const clienteCadastrado = await verificarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));
    const dadosCliente: any = await buscarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')))
    console.log("cliente index...........", clienteCadastrado);

    if (!clienteCadastrado) {
        console.log("cliente index 2...........", clienteCadastrado);
        //const cliente = globalState.setClientCondition('pagamento');
        await newCliente.whatsapp(req, res);
    }

    if (clienteCadastrado) {
        const cliente = globalState.getClientId();
        if(dadosCliente[0].status == 1 || dadosCliente[0].status == 2 ){
            console.log("cliente status 1..2.........", clienteCadastrado);
            const cliente = globalState.setClientCondition('pagamento');
            //await newPagamento.pagamentoWhatsapp(req, res);
        }

        
        
        if (!cliente && dadosCliente[0].status == 3) {
            console.log("entruuuuuuuuuuu");
            const cliente_id = await criarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));
            globalState.setClientId(cliente_id);
            globalState.setClientCondition("inicial");
            globalState.setMensagem([
                req.body.SmsMessageSid,
                req.body.NumMedia,
                req.body.ProfileName,
                req.body.MessageType,
                req.body.SmsSid,
                req.body.WaId,
                req.body.SmsStatus,
                req.body.Body,
                req.body.To,
                req.body.NumSegments,
                req.body.ReferralNumMedia,
                req.body.MessageSid,
                req.body.AccountSid,
                req.body.From,
                req.body.ApiVersion
            ]
            );
        }


        const mensagem = globalState.getMensagem();
        console.log(`ID do cliente armazenado: ${globalState.getClientId()}`);
        console.log(`body do cliente armazenado-->: ${globalState.getMensagem()}`);
        console.log(`body do cliente armazenado-->: ${mensagem}`);
        console.log(`cliente condição-->: ${globalState.getClientCondition()}`)

        // Processar o comando
        if (globalState.getClientCondition() == 'inicial') {
            const command = getCommand(commandName);
            if (command) {
                console.log("Command>>>>", command);
                console.log("Command>>>>", commandName);
                const response = command.execute(args);
                if (commandName == '8') {
                    await sendListPickerMessage(To, From);
                    sendMessage(To, From, '\u{1F63A} Vamos la!! \u{2600}');
                } else {
                    console.log("To>>>>", To);
                    console.log("From>>>>", From);
                    sendMessage(To, From, response);
                }

            } else {

                await sendListPickerMessage(To, From);
                sendMessage(To, From, '\u{1F63A} Vamos la!! \u{2600}');
            }
        } else if (globalState.getClientCondition() == 'despesas' || globalState.getClientCondition() == 'despesas_2' || globalState.getClientCondition() == 'despesas_1') {
            console.log('-----despesas-----');
            await newDespesas.whatsapp(req, res);
        } else if (globalState.getClientCondition() == 'receitas' || globalState.getClientCondition() == 'receitas_2' || globalState.getClientCondition() == 'receitas_1') {
            console.log('-----receitas-----');
            await newReceitas.processarMensagemReceita(req, res);
        } else if (globalState.getClientCondition() == 'investimentos' || globalState.getClientCondition() == 'investimentos_1' || globalState.getClientCondition() == 'investimentos_2') {
            console.log('-----investimentos-----');
            await newInvestimentos.processarMensagemInvestimentos(req, res);
        } else if (globalState.getClientCondition() == 'relatorio' || globalState.getClientCondition() == 'relatorio_1' || globalState.getClientCondition() == 'relatorio_2') {
            console.log('-----relatorio-----');
            await newRelatorio.whatsappRelatorio(req, res);
        } else if (globalState.getClientCondition() == 'cartao' || globalState.getClientCondition() == 'cartao_1' || globalState.getClientCondition() == 'cartao_2') {
            console.log('-----cartao-----');
            await NewCartao.whatsappCartao(req, res);
        } else if (globalState.getClientCondition() == 'conta' || globalState.getClientCondition() == 'conta_1' || globalState.getClientCondition() == 'conta_2') {

            console.log('-----conta-----');
            await NewConta.whatsapp(req, res);
        } else if (globalState.getClientCondition() == 'meta' || globalState.getClientCondition() == 'meta_1' || globalState.getClientCondition() == 'meta_2') {
            console.log('-----meta-----');
            await newMeta.whatsappMeta(req, res);
        } else if (globalState.getClientCondition() == 'pagamento' || globalState.getClientCondition() == 'pagamento_1' || globalState.getClientCondition() == 'pagamento_2') {
            console.log('-----pagamento-----');
            await newPagamento.pagamentoWhatsapp(req, res);
        } else {
            globalState.setClientCondition('inicial');
            sendMessage(To, From, "Desculpe não entendi  mensagem");
        }
    }
});


app.get('/summarize', async (req: Request, res: Response) => {
    try {
        const summarizeServiceDespesas = new SummarizeServiceDespesas();

        const text = `supermercado, 25,00, 10/10/2024, tsste, n`;

        const response = await summarizeServiceDespesas.summarize(text);
        res.json({ text: response });
    } catch (error) {
        console.log(';;;;', error);
        res.status(500).send(error);
    }
});


app.post("/create-payment-link", async (req: Request, res: Response) => {
    await newPagamento.pagamentoLink(req, res);
});


app.post("/create-subscription", async (req: Request, res: Response) => {
    await newPagamento.pagamentoRecorrente(req, res);
   
});


app.post("/webhook", (req: Request, res: Response) => {
    try {
      const { type, data } = req.body;
  
      console.log("Webhook recebido:", req.body);
  
      if (type === "preapproval") {
        const preapprovalId = data.id; // ID da assinatura enviada na notificação
        console.log(`ID da assinatura recebida: ${preapprovalId}`);
        console.log(`corpo da assinatura recebida>>>>>>: ${req.body}`);


        ////////////////////////////////



        ////////////////////////////////////
  
        // Aqui você pode implementar a lógica para salvar ou processar a notificação
        // Exemplo: Atualizar banco de dados com o status da assinatura
      }
  
      // Retornar status 200 para confirmar que a notificação foi recebida
      res.status(200).send("Webhook recebido com sucesso!");
    } catch (error) {
      console.error("Erro ao processar webhook:", error);
      res.status(500).send("Erro ao processar webhook");
    }
  });
  

  

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));










