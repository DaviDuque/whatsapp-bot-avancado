//index para cadastro

import * as dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import './commands';
import { Clientes } from './modules/clientes/clientes.controller';
import { Despesas } from './modules/despesas/despesas.controller';
import { verificarClientePorTelefone } from './modules/clientes/clientes.repository';
import { formatarNumeroTelefone } from './utils/trata-telefone';
import { SummarizeServiceDespesas } from './infra/integrations/summarize.service';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
console.log("index2 cadastro");
app.get('/', (req: Request, res: Response) => {
    res.send('gelo seco');
});

// Armazenamento temporário para os dados do cliente em processo de cadastro
const dadosClientesTemporarios: { [key: string]: any } = {};
const newCliente = new Clientes();
const newDespesas = new Despesas();



//app.post('/whatsapp',  newCliente.whatsapp);
//app.post('/whatsapp/despesas', despesas.whatsapp);

// Rota para o WhatsApp
app.post('/whatsapp', async (req, res) => {
    const { From } = req.body;
    const clienteCadastrado = await verificarClientePorTelefone(formatarNumeroTelefone(From.replace(/^whatsapp:/, '')));

    console.log("index2 c......", req.body);
    if(!clienteCadastrado){
        await newCliente.whatsapp(req, res);
    }

    if(clienteCadastrado){
        await newDespesas.whatsapp(req, res);
        //await newCliente.whatsapp(req, res);
    }

    /*switch (!clienteCadastrado) {
        case 'cadastrar_despesa':
            app.post('/whatsapp/despesas', despesas.whatsapp);
            break;
        case 'cadastrar_cliente':
            await newCliente.whatsapp(req, res);
            //app.post('/whatsapp',  newCliente.whatsapp);
            break;
        default:
            await newCliente.whatsapp(req, res);
            //app.post('/whatsapp',  newCliente.whatsapp);
            //res.status(400).send('Comando não reconhecido. Envie "help" para lista de comandos.');
    }*/
});


app.get('/summarize', async (req: Request, res: Response) => {
    try {
     const summarizeServiceDespesas = new SummarizeServiceDespesas();
 
     const text =  `supermercado, 25,00, 10/10/2024, tsste, n`;
     
     const response = await summarizeServiceDespesas.summarize(text);
     res.json({text: response});
    } catch (error) {
     console.log(';;;;', error);
       res.status(500).send(error);
    }
 });

/*app.post('/whatsapp', async (req: Request, res: Response) => {
    const { From, To, Body } = req.body;
    const [commandName, ...args] = Body.split(' ');

    // Verificar se o cliente já está cadastrado
    const clienteCadastrado = await verificarClientePorTelefone(From);

    if (!clienteCadastrado) {
        // Verificar o estado atual do cliente
        const estadoAtual = verificarEstadoCliente(From);
        // Exemplo de uso: Gerar um código com 10 caracteres
               
        if (!dadosClientesTemporarios[From]) {
            dadosClientesTemporarios[From] = {
                id_endereco: 1, // Aqui você pode ter uma lógica mais robusta para gerenciar endereços
                senha: 'senhaPadrão',
                codigo_indicacao: null
            };
        }

        const novoCliente = dadosClientesTemporarios[From];

        if (!estadoAtual) {
            // Se não tiver estado, começar pedindo o nome
            atualizarEstadoCliente(From, 'aguardando_nome');
            sendMessage(To, From, 'Por favor, envie seu nome para continuar o cadastro.');
        } else if (estadoAtual === 'aguardando_nome') {
            console.log(".............1", Body);
            novoCliente.nome = Body;
            atualizarEstadoCliente(From, 'aguardando_email');
            sendMessage(To, From, 'Obrigado! Agora, envie seu email.');
        } else if (estadoAtual === 'aguardando_email') {
            console.log(".............2", Body);
            novoCliente.email = Body;
            atualizarEstadoCliente(From, 'aguardando_cpf');
            sendMessage(To, From, 'Perfeito! Agora, envie seu CPF.');
        } else if (estadoAtual === 'aguardando_cpf') {
            console.log(".............3", Body);
            novoCliente.cpf = Body;
            novoCliente.telefone = formatarNumeroTelefone(From.replace(/^whatsapp:/, ''));
            novoCliente.codigo_proprio = generateRandomCode(12, novoCliente.telefone.slice(-5));
        
            console.log(".............4", novoCliente.telefone);
            console.log(".............5", novoCliente);

          try{
            const cadastro: any = await cadastrarClienteController(novoCliente); // Chama a lógica de cadastro no banco de dados
            console.log("cadastro", cadastro);
            if(cadastro.error){
                sendMessage(To, From, 'Ocorreu um erro ao realizar o cadastro. Por favor, tente novamente mais tarde.');
            }else{
                sendMessage(To, From, 'Cadastro realizado com sucesso! Obrigado.');
            }



 

            
           

            
            limparEstadoCliente(From);  // Limpa o estado após o cadastro
            delete dadosClientesTemporarios[From];  // Remove os dados temporários após o cadastro
        } catch (error) {
            console.error("Erro ao cadastrar cliente:", error);
            
            // Se ocorrer um erro no cadastro, envia a mensagem de falha
            sendMessage(To, From, 'Ocorreu um erro ao realizar o cadastro. Por favor, tente novamente mais tarde.');
        }
        }

        return res.send("Processo de cadastro em andamento.");
    }

    // Processar o comando caso o cliente já esteja cadastrado
    const command = getCommand(commandName);
    if (command) {
        const response = command.execute(args);
        sendMessage(To, From, response);
    } else {
        sendMessage(To, From, '\u{1F63A} Olá, não entendi. Comando não reconhecido. \u{2600} \n \u{1F3C4} Digite "8" para lista de opções. \n \u{1F525} Digite "9" para sair.');
    }

    res.send("Mensagem recebida!");
});*/

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));










