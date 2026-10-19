🎙️ Assistente de Voz com IA (Painel Web)
Este projeto é a interface web (painel) para um assistente de voz inteligente. Ele grava a sua pergunta pelo microfone, envia para um cérebro/orquestrador (n8n) que processa a transcrição e gera uma resposta via Inteligência Artificial, devolvendo o áudio falado diretamente na sua tela.

⚙️ Pré-requisitos
Para usar este painel, você precisará de:

Os arquivos do painel (index.html, style.css e app.js).

O workflow do n8n já importado, configurado com suas credenciais da OpenAI e ativo.

Um servidor local simples (como a extensão Live Server do VS Code) ou hospedagem HTTPS. O microfone não funcionará se você abrir o arquivo apenas com duplo clique (file://).

🚀 Configuração Rápida
Antes de usar o painel, você precisa conectá-lo ao seu n8n.

Abra o seu painel do n8n e certifique-se de que o workflow do Assistente de Voz está Ativo.

No nó inicial (Webhook), copie a Production URL (URL de Produção).

Abra o arquivo app.js no seu editor de código.

Localize a seguinte linha e substitua o texto pela URL que você copiou:

JavaScript
const URL_WEBHOOK_N8N = "COLE_AQUI_A_URL_DO_WEBHOOK_N8N";
Salve o arquivo. (Aviso: Nunca coloque chaves de API da OpenAI neste arquivo, elas devem ficar seguras apenas dentro do n8n).

🎤 Como Usar
Inicie o painel: Abra o index.html usando o Live Server (localhost) ou acesse pelo seu domínio HTTPS.

Permita o microfone: O navegador pedirá permissão para acessar o seu microfone. Clique em "Permitir".

Faça sua pergunta:

Clique no botão de gravação. O botão mudará para a cor vermelha, indicando que está gravando.

Fale a sua pergunta com clareza.

Clique novamente no botão vermelho para parar a gravação e enviar o áudio.

Ouça a resposta: Aguarde alguns segundos. O sistema vai transcrever seu áudio, pensar em uma resposta de até três frases e gerar a fala. O MP3 com a resposta da IA será reproduzido automaticamente e também ficará disponível no controle de áudio na tela.

🛠️ Solução de Problemas Comuns
O microfone não liga: Verifique se você está acessando via localhost ou https://. Navegadores bloqueiam o uso do microfone em sites não seguros (http:// comum) ou caminhos locais (file://).

Erro "Failed to fetch" ou problemas de CORS: Isso significa que o painel não está conseguindo se comunicar com o n8n. Certifique-se de que o n8n permite requisições do endereço onde o seu painel está hospedado.

O áudio foi gravado, mas não há resposta: Verifique se você colocou a Production URL no app.js. Se você colocou a Test URL, ela só funcionará se o n8n estiver com o botão "Listen for test event" aberto aguardando o envio.