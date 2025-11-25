/* --- Elementos do DOM --- */
const apiKeyInput = document.getElementById("apiKey");
const temaSelect = document.getElementById("temaSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const resetButton = document.getElementById("resetButton");
const aiResponse = document.getElementById("aiResponse");
const form = document.getElementById("form");
const result = document.getElementById("result");
const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("shareBtn");
const downloadExcelBtn = document.getElementById("downloadExcelBtn");

/* --- LOCALSTORAGE: Carregar API Key ao abrir --- */
document.addEventListener("DOMContentLoaded", () => {
  const savedKey = localStorage.getItem("api_key");
  if (savedKey) {
    apiKeyInput.value = savedKey;
  }
});

/* --- LOCALSTORAGE: Salvar API Key automaticamente --- */
apiKeyInput.addEventListener("input", () => {
  localStorage.setItem("api_key", apiKeyInput.value.trim());
});

/* --- Conversor Markdown -> HTML --- */
const markdownToHTML = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
};

/* --- PROMPT (SEM VARIÁVEIS SUBJETIVAS) --- */
const buildStatisticalDataPrompt = (tema, pergunta) => {
  return `
## Especialidade
Você é um Engenheiro de Dados Educacionais especializado em simulação de dados, utilizando distribuições estatísticas aplicáveis ao comportamento humano e aprendizagem. Utilize uma linguagem simples, moderna e acessível para adolescentes, evitando jargões técnicos e explicando conceitos com leveza.

## Contexto
Tema: ${tema}
Pergunta/Requisito: ${pergunta}

## Tarefa
Gere um conjunto de **dados simulados** seguindo os requisitos abaixo. Os valores devem remeter ao cotidiano dos jovens (tempo de estudo, uso de redes sociais, rotina, tempo de lazer, desempenho escolar).

### ✔ FORMATO OBRIGATÓRIO DA TABELA (TEXTO PURO)
A tabela DEVE ser gerada no seguinte formato:

Cada linha deve ser escrita separadamente usando \n.
Nenhuma linha pode conter outra tabela dentro dela.

Formato exato que você DEVE seguir:

| ID | VariavelPrincipal | VariavelRelacionada | ResultadoEstimado |\n
| --- | --- | --- | --- |\n
| 1 | 3.5 | 7.1 | 8.2 |\n
| 2 | 4.1 | 6.3 | 7.4 |\n
| 3 | 2.7 | 5.9 | 6.1 |\n
...

REGRAS:
- Cada linha da tabela TERMINA com \\n
- Nunca remover as quebras
- Nunca gerar duas tabelas
- Nunca inserir comentários dentro da tabela

### ✔ ESTRUTURA DA TABELA
A tabela deve ter 50 linhas:
- 1 cabeçalho
- 49 amostras

Colunas:
1. **Variável Principal** — relacionada ao tema.
2. **Variável Relacionada** — outro fator que influencia.
3. **Resultado Estimado** — métrica OBJETIVA (nota, desempenho, produtividade).  
❗ A IA NÃO pode gerar valores subjetivos (humor, energia, ansiedade etc.) e as variáveis devem ser relacionadas ao tema que o usuario escolher não use as palavras como "Variável Principal, Variável Relacionada e etc.

Valores: simples, distribuídos estatisticamente e coerentes com o tema.

### ✔ Após a tabela:
Crie uma seção **Análise Didática**, explicando:
- significados das colunas,
- distribuição usada,
- correlação,
- explicação pedagógica para adolescentes.

## Regras finais
- Gere somente tabela + análise didática.
- Sem código.
- Mínimo 1000 caracteres.
Agora produza a resposta.
`;
};

/* --- Função de geração via OpenAI Chat --- */
const gerarAnaliseAI = async (prompt, apiKey) => {
  if (!apiKey) {
    return `Modo offline: necessário fornecer API Key.`;
  }

  const url = "https://api.openai.com/v1/chat/completions";
  const model = "gpt-4o-mini";

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content:
              "Você é um engenheiro de dados educacionais especializado em estatísticas aplicadas. Gere uma tabela em Markdown conforme o prompt e uma análise didática. Responda em português.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.0,
        max_tokens: 4000,
      }),
    });

    const data = await resp.json();
    if (data.error) {
      console.error("Erro da API OpenAI:", data.error);
      return `**Erro:** ${data.error.message || "Erro na API OpenAI"}`;
    }

    return data.choices[0].message.content;
  } catch (err) {
    console.error("Erro ao chamar OpenAI:", err);
    return "**Erro:** falha ao obter resposta da API OpenAI.";
  }
};

/* --- Extrair tabela Markdown --- */
const extrairTabelaMarkdown = () => {
  const fullText = aiResponse.innerText || "";
  const partes = fullText.split("## Análise Didática");
  return partes[0].trim();
};

/* --- Gerar Excel --- */
const baixarExcel = () => {
  const markdown = extrairTabelaMarkdown();
  if (!markdown) {
    alert("Nenhuma tabela encontrada para exportar.");
    return;
  }

  const linhasValidas = markdown
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|") && l.endsWith("|"));

  if (linhasValidas.length < 2) {
    alert("A tabela Markdown está incompleta.");
    return;
  }

  const linhasSemSeparador = linhasValidas.filter((l) => !l.includes("---"));

  const tabela = linhasSemSeparador.map((linha) =>
    linha
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim())
  );

  const ws = XLSX.utils.aoa_to_sheet(tabela);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Dados");

  XLSX.writeFile(wb, "tabela.xlsx");
};

/* --- Salvar TXT --- */
const salvarTxt = (filename, text) => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/* --- Envio do formulário --- */
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

  aiResponse.innerHTML = markdownToHTML(rawText);

  askButton.disabled = false;
  askButton.textContent = "Gerar Dados";
};

/* --- Resetar formulário (mantém API Key) --- */
const resetForm = () => {
  const apiKeySalva = localStorage.getItem("api_key");

  form.reset();

  apiKeyInput.value = apiKeySalva || "";

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
downloadExcelBtn.addEventListener("click", baixarExcel);

/* --- Inicialização --- */
resetForm();
