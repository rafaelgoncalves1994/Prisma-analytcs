# Prisma Analytics

O Prisma Analytics é uma aplicação web criada com a proposta de tornar análises educacionais mais acessíveis, claras e úteis para estudantes e professores. A ferramenta permite que o usuário selecione um tema acadêmico, escreva uma pergunta e receba uma análise detalhada gerada pela API do ChatGPT. Todo o processamento é feito de forma simples e direta, sem etapas desnecessárias, permitindo que o usuário foque apenas no conteúdo.

A aplicação converte automaticamente qualquer tabela presente na resposta da IA para um arquivo Excel, possibilitando baixar os dados com apenas um clique. Além disso, oferece botões para salvar o texto da análise em formato `.txt` ou copiar o conteúdo para a área de transferência. A API Key é armazenada localmente no navegador, evitando que o usuário precise redigitá-la após recarregar a página.

O projeto foi desenvolvido utilizando apenas HTML, CSS e JavaScript puro, garantindo compatibilidade total com hospedagem gratuita no GitHub Pages e mantendo a estrutura leve. Recursos externos foram adicionados apenas quando realmente necessários, como a conversão de Markdown e a geração de planilhas.

O objetivo do Prisma Analytics é proporcionar uma experiência prática e funcional, aproximando o usuário de reflexões baseadas em dados e estimulando a análise crítica dentro do ambiente educacional. Apesar de ser um projeto acadêmico, ele foi pensado para ter continuidade e espaço para melhorias.

---

## Tecnologias Utilizadas

A aplicação utiliza HTML5, CSS3 e JavaScript puro no frontend. Para dar suporte ao processamento da resposta da IA, são usadas bibliotecas como Showdown.js (para converter Markdown em HTML) e SheetJS (para gerar arquivos Excel). A inteligência artificial é fornecida pela API oficial do ChatGPT.

---

## Como Usar

Para utilizar a aplicação, basta informar sua API Key do ChatGPT, selecionar um tema e escrever sua pergunta. A resposta é exibida diretamente na página, e, caso contenha tabelas, é possível gerar uma versão em Excel automaticamente. Os botões adicionais permitem salvar o conteúdo em texto ou copiá-lo para uso imediato.

---

## Estrutura do Projeto
/
│── index.html
│── style.css
│── script.js
│── assets/
│── tutorial.html


---

## Considerações Finais

O Prisma Analytics foi idealizado para oferecer praticidade e acessibilidade ao lidar com conteúdos educacionais baseados em dados. Ele serve como uma ferramenta de apoio para estudos, pesquisas e produção de materiais. Trata-se de um projeto construído com foco em clareza, utilidade e facilidade de uso, oferecendo um caminho simples para explorar informações e gerar insights significativos.

