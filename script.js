/* --- Elementos do DOM --- */
const apiKeyInput = document.getElementById("apiKey");
const temaSelect = document.getElementById("temaSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const resetButton = document.getElementById("resetButton");
const aiResponse = document.getElementById("aiResponse");
const form = document.getElementById("form");
const result = document.getElementById("result");
const chartImage = document.getElementById("chartImage");
const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("shareBtn");

/* --- Conversor Markdown -> HTML --- */
const markdownToHTML = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
};

/* --- Mapeamento de imagens ---
   Atualizado com os novos temas do Prisma Analytics */
const imageMap = {
  rotina: "./assets/grafico_rotina.png",
  conexoes: "./assets/grafico_conexoes.png",
  foco: "./assets/grafico_foco.png",
  habitos: "./assets/grafico_habitos.png",
  motivacao: "./assets/grafico_motivacao.png",
  tecnologia: "./assets/grafico_tecnologia.png",
  bemestar: "./assets/grafico_bemestar.png",
  grupo: "./assets/grafico_grupo.png",
  metas: "./assets/grafico_metas.png",
  criatividade: "./assets/grafico_criatividade.png",
};

/* --- Construção do prompt para a IA --- */
const buildPrompt = (tema, pergunta) => {
  return `
## Especialidade
Você é um analista de dados educacionais no Prisma Analytics, especialista em comportamento humano e estatísticas aplicadas à aprendizagem.

## Contexto
Tema: ${tema}
Pergunta: ${pergunta}

## Tarefa
Gere uma interpretação breve e clara sobre os padrões ou relações observadas no gráfico, abordando:
- O que os dados sugerem sobre o comportamento estudantil.
- Possíveis causas e impactos educacionais.
- Duas recomendações práticas para melhorar o desempenho ou o bem-estar.

## Regras
- Limite-se a 1500 caracteres.
- Escreva em linguagem acessível, mas mantendo rigor acadêmico.
- Formate em Markdown, sem introduções ou despedidas.

Agora produza a resposta.
`;
};

/* --- Função para gerar análise usando API --- */
const gerarAnaliseAI = async (prompt, apiKey) => {
  if (!apiKey) {
    return `**Modo offline (simulação):** Sem API Key, não é possível gerar interpretação automática.  
Sugestão: analise médias, tendências e correlações. Por exemplo, se a curva de foco cai com o uso intenso de tecnologia, incentive pausas digitais e rotinas de descanso ativo.`;
  }

  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = [{ role: "user", parts: [{ text: prompt }] }];
  const tools = [{ google_search: {} }];

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents, tools }),
    });

    const data = await resp.json();
    if (!data?.candidates?.length) throw new Error("Resposta inválida da API");
    return data.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error("Erro ao gerar análise:", err);
    return `**Erro:** falha ao obter resposta. Verifique sua API Key e conexão.`;
  }
};

/* --- Salvar texto como .txt --- */
const salvarTxt = (filename, text) => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/* --- Envio do formulário principal --- */
const enviarFormulario = async (event) => {
  event.preventDefault();

  const apiKey = apiKeyInput.value.trim();
  const tema = temaSelect.value;
  const question = questionInput.value.trim();

  if (!tema || !question) {
    alert("Preencha o tema e a pergunta/descrição.");
    return;
  }

  chartImage.src = imageMap[tema] || "./assets/FOA-JPG.jpg";
  result.classList.remove("hidden");
  aiResponse.innerHTML = "<p>Gerando análise...</p>";

  askButton.disabled = true;
  askButton.textContent = "Gerando...";

  const prompt = buildPrompt(tema, question);
  const rawText = await gerarAnaliseAI(prompt, apiKey);
  aiResponse.innerHTML = markdownToHTML(rawText);

  askButton.disabled = false;
  askButton.textContent = "Gerar Análise";
};

/* --- Resetar formulário --- */
const resetForm = () => {
  form.reset();
  result.classList.add("hidden");
  aiResponse.innerHTML = "";
  chartImage.src = "./assets/placeholder.png";
};

/* --- Copiar texto --- */
const copiarTexto = () => {
  const text = aiResponse.innerText || aiResponse.textContent || "";
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    shareBtn.textContent = "Copiado!";
    setTimeout(() => (shareBtn.textContent = "Copiar texto"), 1500);
  });
};

/* --- Salvar análise --- */
const salvarAnalise = () => {
  const text = aiResponse.innerText || aiResponse.textContent || "";
  if (!text) {
    alert("Nenhuma análise disponível para salvar.");
    return;
  }
  const tema = temaSelect.value || "analise";
  const filename = `prisma_${tema}_${new Date()
    .toISOString()
    .slice(0, 10)}.txt`;
  salvarTxt(filename, text);
};

/* --- Event listeners --- */
form.addEventListener("submit", enviarFormulario);
resetButton.addEventListener("click", resetForm);
shareBtn.addEventListener("click", copiarTexto);
downloadBtn.addEventListener("click", salvarAnalise);

/* --- Inicialização --- */
resetForm();
