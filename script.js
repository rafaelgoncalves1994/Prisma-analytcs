/* --- Elementos do DOM --- */
const apiKeyInput = document.getElementById("apiKey");
const temaSelect = document.getElementById("temaSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const resetButton = document.getElementById("resetButton");
const aiResponse = document.getElementById("aiResponse");
const form = document.getElementById("form");
const result = document.getElementById("result");
// Elementos removidos/alterados no novo fluxo:
const chartImage = document.getElementById("chartImage"); // Gráfico não é mais o foco
const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("shareBtn");

/* --- Conversor Markdown -> HTML --- */
// (showdown.Converter precisa ser carregado no seu HTML)
const markdownToHTML = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
};


const imageMap = {};

// --- NOVO PROMPT ADAPTADO ---
const buildStatisticalDataPrompt = (tema, pergunta) => {
  return `
## Especialidade
Você é um Engenheiro de Dados Educacionais no Prisma DataGen, especializado em **simulação de dados** para fins didáticos e aplicação de **distribuições estatísticas** em contextos de aprendizagem.

## Contexto
**Tema:** ${tema} (Define o contexto das variáveis e dos dados)
**Pergunta/Requisito:** ${pergunta} (Define o foco da análise ou a distribuição estatística a ser aplicada)

## Tarefa
Gere um **conjunto de dados simulados** seguindo as especificações abaixo. O contexto das variáveis deve ser relevante ao **Tema** (ex: ${tema}), e a distribuição principal deve ser definida pelo **Requisito** (pergunta/distribuição solicitada pelo usuário, ou uma distribuição plausível se não especificada).

1.  **Gere uma tabela completa em formato Markdown com exatamente 50 linhas** (1 de cabeçalho + 49 amostras).
2.  A tabela deve incluir:
    * **Uma coluna de Variável Principal**, simulando uma métrica de tempo, desempenho, ou comportamento chave, **aplicando a distribuição estatística sugerida pelo Requisito** (ou assumindo uma distribuição normal/plausível se não especificada).
    * **Pelo menos duas colunas adicionais de Variáveis Relacionadas**, cujos valores devem simular uma relação realista com a Variável Principal e com o contexto do **Tema**.
3.  Os valores devem ser **aleatórios, não repetitivos** e simular variabilidade realista. **Se necessário, utilize seu acesso a informações externas para simular dados mais realistas.**

**Após a tabela, inclua uma seção de Análise Didática:**
- Explique de forma clara o que cada coluna de dados representa, correlacionando com o **Tema**.
- Descreva a **distribuição estatística** aplicada à Variável Principal e o motivo de sua escolha (se foi a do Requisito ou uma suposição).
- Explique a **relação simulada** entre a Variável Principal e as duas Variáveis Relacionadas, focando no propósito didático.

## Regras
- **NUNCA** indique código externo para geração de dados.
- O resultado deve ser **SOMENTE** o conteúdo gerado (tabela + análise), **sem introduções ou despedidas.**
- **Não inclua resumo da tabela**. Apresente a tabela por completo.
- Mantenha um estilo **claro, didático e rigoroso**, adequado ao ensino de estatística.
- **Limite-se a um minimo de 1000 caracteres no total** (incluindo a tabela e a análise didática).

Agora produza a resposta.
`;
};

/* --- Função para gerar análise usando API --- */
const gerarAnaliseAI = async (prompt, apiKey) => {
  if (!apiKey) {
    return `**Modo offline (simulação):** Sem API Key, não é possível gerar dados simulados.`;
  }

  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = [{ role: "user", parts: [{ text: prompt }] }];
  // Mantenha o Google Search (tools) para permitir a busca de "dados reais"
  const tools = [{ google_search: {} }];

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents, tools }),
    });

    const data = await resp.json();
    if (!data?.candidates?.length) throw new Error("Resposta inválida da API");
    // Se a API retornar a resposta dentro de uma chamada de função (tool call),
    // é necessário buscar o texto do resultado.
    const resultText = data.candidates[0].content.parts[0].text;

    // Verifica se houve uma chamada de ferramenta (tool) e retorna a resposta do assistente
    if (data.candidates[0].content.parts[0].functionCall) {
      // Para este caso, a resposta completa deve ser processada no próximo passo da interação
      // Como o prompt pede que a IA gere a tabela diretamente, a resposta deve vir no 'text'
      return resultText;
    }

    return resultText;
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

  // --- ALTERAÇÃO PRINCIPAL AQUI: Gráfico Removido/Substituído ---
  // A imagem não faz mais sentido, mas deixo o elemento 'chartImage'
  // apontando para um placeholder, caso a estrutura visual precise dele.
  chartImage.src = "./assets/placeholder.png";

  result.classList.remove("hidden");
  aiResponse.innerHTML = "<p>Gerando dados simulados...</p>";

  askButton.disabled = true;
  askButton.textContent = "Gerando...";

  // --- ALTERAÇÃO CRUCIAL AQUI: Chamada da Nova Função do Prompt ---
  const prompt = buildStatisticalDataPrompt(tema, question);
  const rawText = await gerarAnaliseAI(prompt, apiKey);

  aiResponse.innerHTML = markdownToHTML(rawText);

  askButton.disabled = false;
  askButton.textContent = "Gerar Dados"; // Mudança de texto
};

/* --- Resetar formulário --- */
const resetForm = () => {
  form.reset();
  result.classList.add("hidden");
  aiResponse.innerHTML = "";
  chartImage.src = "./assets/placeholder.png"; // Reset da imagem/placeholder
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
    alert("Nenhum dado simulado disponível para salvar.");
    return;
  }
  const tema = temaSelect.value || "dados_simulados";
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
