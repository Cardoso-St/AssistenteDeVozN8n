// URL de PRODUÇÃO do Webhook no n8n
const URL_WEBHOOK_N8N =
  "https://cardoso-st.app.n8n.cloud/webhook-test/assistente-voz";

const botao = document.querySelector("#botaoGravar");
const textoBotao = document.querySelector("#textoBotao");
const status = document.querySelector("#status");
const resultado = document.querySelector("#resultado");
const pergunta = document.querySelector("#pergunta");
const resposta = document.querySelector("#resposta");
const audioResposta = document.querySelector("#audioResposta");
const vozSelecionada = document.querySelector("#vozSelecionada");

let gravador;
let partesAudio = [];
let vozes = [];

// Carrega as vozes instaladas no computador/navegador.
function carregarVozes() {
  if (!("speechSynthesis" in window) || !vozSelecionada) return;

  vozes = speechSynthesis.getVoices();
  vozSelecionada.innerHTML = "";

  const vozesEmPortugues = vozes.filter((voz) =>
    voz.lang.toLowerCase().startsWith("pt")
  );

  const lista = vozesEmPortugues.length ? vozesEmPortugues : vozes;

  if (!lista.length) {
    vozSelecionada.innerHTML =
      "<option>Nenhuma voz disponível</option>";
    return;
  }

  lista.forEach((voz) => {
    const opcao = document.createElement("option");
    opcao.value = voz.name;
    opcao.textContent = `${voz.name} (${voz.lang})`;
    vozSelecionada.append(opcao);
  });
}

if ("speechSynthesis" in window) {
  speechSynthesis.onvoiceschanged = carregarVozes;
  carregarVozes();
}

// Inicia ou encerra a gravação.
botao.addEventListener("click", async () => {
  if (gravador?.state === "recording") {
    gravador.stop();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    gravador = new MediaRecorder(stream);
    partesAudio = [];

    gravador.ondataavailable = (evento) => {
      partesAudio.push(evento.data);
    };

    gravador.onstop = () => {
      enviarAudio(stream);
    };

    gravador.start();

    botao.classList.add("gravando");
    textoBotao.textContent = "Parar gravação";
    atualizarStatus("Gravando sua pergunta", "gravando");
  } catch (erro) {
    atualizarStatus("Autorize o uso do microfone no navegador.", "erro");
    console.error(erro);
  }
});

// Envia o áudio ao Webhook do n8n.
async function enviarAudio(stream) {
  botao.classList.remove("gravando");
  botao.classList.add("processando");
  botao.disabled = true;

  textoBotao.textContent = "Pensando…";
  atualizarStatus("O assistente está pensando", "processando");

  stream.getTracks().forEach((track) => track.stop());

  try {
    const audio = new Blob(partesAudio, {
      type: "audio/webm",
    });

    const dados = new FormData();

    // "data" deve ser igual ao Input Data Field Name no n8n.
    dados.append("data", audio, "pergunta.webm");

    const requisicao = await fetch(URL_WEBHOOK_N8N, {
      method: "POST",
      body: dados,
    });

    if (!requisicao.ok) {
      throw new Error(`Webhook respondeu com erro ${requisicao.status}`);
    }

    const retorno = await requisicao.json();

    pergunta.textContent = retorno.pergunta || "Áudio enviado";
    resposta.textContent =
      retorno.resposta || "Não recebi uma resposta do assistente.";

    resultado.hidden = false;

    // Fala a resposta usando a voz escolhida no seletor.
    falarNoNavegador(retorno.resposta);

    // Mantém o MP3 do n8n disponível no player como alternativa.
    if (retorno.audioBase64) {
      audioResposta.src = retorno.audioBase64.startsWith("data:")
        ? retorno.audioBase64
        : `data:audio/mpeg;base64,${retorno.audioBase64}`;
    }

    atualizarStatus("Resposta pronta para você", "pronto");
  } catch (erro) {
    atualizarStatus(
      "Não consegui falar com o n8n. Confira o workflow.",
      "erro"
    );
    console.error(erro);
  } finally {
    botao.disabled = false;
    botao.classList.remove("processando");
    textoBotao.textContent = "Falar agora";
  }
}

// Fala com a voz escolhida no navegador.
function falarNoNavegador(texto) {
  if (!texto || !("speechSynthesis" in window)) return;

  speechSynthesis.cancel();

  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = "pt-BR";
  fala.rate = 1;
  fala.pitch = 1;

  if (vozSelecionada) {
    fala.voice =
      vozes.find((voz) => voz.name === vozSelecionada.value) || null;
  }

  speechSynthesis.speak(fala);
}

// Atualiza a mensagem exibida abaixo do botão.
function atualizarStatus(mensagem, estado) {
  status.className = `status ${estado}`;
  status.innerHTML = `<span class="status-ponto"></span> ${mensagem}`;
}