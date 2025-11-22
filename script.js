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

/* --- CSV → Markdown converter --- */
const csvToMarkdown = (csv) => {
  const rows = csv.trim().split("\n");
  const table = rows.map((row) => {
    return "| " + row.split(",").join(" | ") + " |";
  });

  const header = table[0];
  const separator = header.replace(/[^|]/g, "-");

  return [header, separator, ...table.slice(1)].join("\n");
};

/* --- Conversor Markdown -> HTML --- */
const markdownToHTML = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
};

const imageMap = {};

/* --- NOVO PROMPT (VERSÃO CSV DEFINITIVA) --- */
const buildStatisticalDataPrompt = (tema, pergunta) => {
  return `
## Especialidade
Você é um Engenheiro de Dados Educacionais especializado em simulação de dados, utilizando distribuições estatísticas aplicáveis ao comportamento humano e aprendizagem.

## Contexto
Tema: ${tema}
Pergunta/Requisito: ${pergunta}

## Tarefa
Gere um conjunto de **dados simulados** seguindo os requisitos abaixo.

### ✔ FORMATO OBRIGATÓRIO DA TABELA (CSV)
A tabela **DEVE** ser gerada EXCLUSIVAMENTE no formato **CSV**, exatamente como no Excel.  
REGRAS CRÍTICAS:
- Colunas separadas por vírgulas.
- Cada linha deve estar em uma linha distinta, sem exceções.
- Nunca coloque duas linhas na mesma linha do texto.
- Nunca use barras verticais "|" — apenas CSV puro.
- Primeira linha é o cabeçalho.
- Exemplo:
ID,VariavelPrincipal,VariavelA,VariavelB
1,3.5,7.2,1.9
2,4.1,6.7,2.3

### ✔ ESTRUTURA DA TABELA
A tabela deve ter **50 linhas**:
- 1 linha de cabeçalho
- 49 linhas de amostras

Colunas obrigatórias:
1. Variável Principal — distribuída de acordo com o Requisito.
2. Variável Relacionada A — correlacionada com a principal.
3. Variável Relacionada B — outra relação coerente com o Tema.

Valores:
- aleatórios,
- não repetidos,
- distribuídos estatisticamente,
- coerentes com o Tema.

### ✔ Após o CSV, gere:
Uma seção chamada **Análise Didática**, explicando:
- o que representa cada coluna,
- a distribuição utilizada,
- como foi simulada a correlação,
- como interpretar pedagogicamente os dados.

## Regras finais
- Gere **somente** o CSV + análise didática.
- Nada de código.
- Nada de explicações fora da seção final.
- Mínimo de 1000 caracteres.
Agora produza a resposta.
`;
};

/* --- Função para gerar análise usando Gemini --- */
const gerarAnaliseAI = async (prompt, apiKey) => {
  if (!apiKey) {
    return `Modo offline: necessário fornecer API Key.`;
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
    console.error("Erro:", err);
    return "**Erro:** falha ao obter resposta.";
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
    alert("Preencha o tema e a pergunta.");
    return;
  }

  aiResponse.innerHTML = "<p>Gerando dados simulados...</p>";
  result.classList.remove("hidden");
  askButton.disabled = true;
  askButton.textContent = "Gerando...";

  const prompt = buildStatisticalDataPrompt(tema, question);
  const rawText = await gerarAnaliseAI(prompt, apiKey);

  /* --- Separar CSV da análise --- */
  const parts = rawText.split("Análise Didática");
  const csv = parts[0].trim();
  const analise = "Análise Didática" + parts[1];

  const markdown = csvToMarkdown(csv) + "\n\n" + analise;

  aiResponse.innerHTML = markdownToHTML(markdown);

  askButton.disabled = false;
  askButton.textContent = "Gerar Dados";
};

/* --- Resetar formulário --- */
const resetForm = () => {
  form.reset();
  result.classList.add("hidden");
  aiResponse.innerHTML = "";
};

/* --- Copiar texto --- */
const copiarTexto = () => {
  const text = aiResponse.innerText || aiResponse.textContent || "";
  navigator.clipboard.writeText(text);
  shareBtn.textContent = "Copiado!";
  setTimeout(() => (shareBtn.textContent = "Copiar texto"), 1500);
};

/* --- Salvar análise --- */
const salvarAnalise = () => {
  const text = aiResponse.innerText || aiResponse.textContent || "";
  const tema = temaSelect.value || "dados";
  salvarTxt(`prisma_${tema}.txt`, text);
};

/* --- Event listeners --- */
form.addEventListener("submit", enviarFormulario);
resetButton.addEventListener("click", resetForm);
shareBtn.addEventListener("click", copiarTexto);
downloadBtn.addEventListener("click", salvarAnalise);

/* --- Inicialização --- */
resetForm();
