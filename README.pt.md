# Satyasiddhiśāstra (成實論) — Tratado da Realização da Verdade

Uma aplicação web trilingue (Chinês, Inglês, Português) e interativa, dedicada ao estudo e análise filológica do **Satyasiddhiśāstra** (Chengshilun / 成實論), de autoria de Harivarman e traduzido por Kumārajīva.

Esta plataforma foi desenvolvida para proporcionar uma experiência de leitura rigorosa e exata, alinhada com as tradições filosóficas Abhidharmika e Sautrantika.

Read this in [English](README.md).

## 🌟 Principais Funcionalidades

### 📖 Leitura Interativa Trilingue
* Leia o texto clássico chinês budista lado a lado com suas traduções em inglês ou português.
* **Modos de Idioma:** Alterne facilmente entre 中文/English, 中文/Português e English/Português.
* **Paginação por Capítulos:** Navegação eficiente exibindo um capítulo por vez para garantir uma performance ideal, equipada com um índice de capítulos completo e setas de navegação intuitivas.

### 🔍 Dicionário Filológico Avançado
* **100% de Cobertura do Corpus:** Absolutamente todos os caracteres (*hanzi*) do tratado foram mapeados e traduzidos isoladamente.
* **Tooltips Interativos:** Clique em qualquer caractere chinês para abrir um balão (*tooltip*) exibindo seus significados em inglês e português, a pronúncia em Pinyin, e seus equivalentes em Sânscrito/Pāli quando relevante.
* **Semântica de Compostos:** O sistema detecta automaticamente quando um caractere opera dentro de uma palavra composta (ex: 答曰, 涅槃, 煩惱) e fornece a exata acepção contextual no mesmo tooltip.

### ✨ Alinhamento Semântico Bidirecional
* **Realce Exato (Highlight):** Ao clicar em um caractere ou composto, além de abrir o dicionário, o sistema aplica um realce visual na tradução correspondente exata na coluna em inglês ou português.
* **Correspondência Rigorosa:** O alinhamento visual opera sob condições estritamente filológicas. Termos só são realçados quando o pareamento entre o texto original e a tradução é exato e inquestionável.

### 🧠 Sistema de Memorização Espaçada (Mecânica Anki / SRS)
* Sistema de Repetição Espaçada (SRS) integrado, reproduzindo a mecânica do software Anki.
* Focado na memorização dos caracteres específicos do tratado.
* **Ordenação Baseada em Frequência:** Os cartões (*flashcards*) são introduzidos com base na contagem exata de ocorrências no corpus do *Satyasiddhiśāstra* (ordem decrescente de frequência).
* Salva o progresso de estudo persistentemente no `localStorage` do navegador.
* Suporta atalhos de teclado (Espaço para revelar, 1-4 para avaliar, Esc para sair).

### 📥 Exportação de Documentos
* **Exportação para PDF:** Gere documentos PDF sanitizados dos capítulos atuais, formatados com margens espaçosas de 1,5cm, fonte hiperlegível tamanho 14, paginação nos rodapés e um Índice de Capítulos totalmente interativo e clicável.
* **Exportação para EPUB:** Baixe arquivos EPUB3 totalmente estruturados, com Índice funcional nativo (TOC) que conecta diretamente aos respectivos capítulos, estilizados com o esquema de cores da plataforma para leitura offline em e-readers.

## 🛠️ Arquitetura Técnica

Trata-se de uma Single Page Application (SPA) moderna, construída com foco em performance e manutenibilidade.

* **Frontend:** React 18, TypeScript, Vite.
* **Estilização:** Tailwind CSS (Tipografia customizada nas cores Creme `#FBF5E6` e Marrom `#3B2714`).
* **Gerenciamento de Estado:** `useReducer` do React para transições de estado previsíveis.
* **Testes Automatizados:** Vitest combinado com `@testing-library/react`. Atinge excepcionais **>98.5% de Code Coverage** (Cobertura de Código).
* **CI/CD:** Esteira automatizada via GitHub Actions para integração contínua e implantação (*deploy*) determinística no GitHub Pages.

### Estrutura do Projeto
```
src/
├── components/
│   ├── layout/      # Layout base (App, Reader)
│   ├── ui/          # Componentes de interface (Column, HanziTooltip, ChapterIndex)
│   └── features/    # Funcionalidades complexas (AnkiReview, SettingsModal)
├── store/           # Reducer e ações (actions)
├── export/          # Lógica de geração de PDF e EPUB (jsPDF, jszip)
├── types/           # Interfaces TypeScript
├── styles/          # Ponto de entrada do Tailwind
└── test/            # Configuração e mocks do Vitest
```

## 🚀 Como Começar

### Pré-requisitos
* Node.js (v20+ recomendado)
* npm

### Instalação
1. Clone o repositório:
   ```bash
   git clone <repository-url>
   cd satyasiddhishastrasite
   ```
2. Instale as dependências (requer `legacy-peer-deps` devido a combinações específicas de bibliotecas):
   ```bash
   npm install --legacy-peer-deps
   ```

### Desenvolvimento
Inicie o servidor de desenvolvimento local do Vite:
```bash
npm run dev
```

### Testes
Execute a bateria de testes unitários e de integração:
```bash
npm test
```
Gere o relatório de cobertura de código (*coverage*):
```bash
npm run test:coverage
```

### Build para Produção
Gere o artefato estático no diretório `dist/`:
```bash
npm run build
```

## 🔄 Pipeline de CI/CD
Este projeto está configurado com o GitHub Actions. Qualquer `push` ou mesclagem de pull request para a branch `main` aciona automaticamente a esteira configurada em `.github/workflows/deploy.yml`. Ela realiza checagem de tipos, testes rigorosos com relatório de cobertura, compila o artefato (build) e realiza a implantação automatizada para o **GitHub Pages**.

## 🙏 Agradecimentos

Este trabalho só foi possível graças às aulas inspiradoras e aos anos de estudo aprofundado com meu Professor de *Abhidharma* e *Vipassana* (discernimento) acerca do *Satyasiddhiśāstra* (*Chengshilun*) de Harivarman, o **Sensei Joaquim Monteiro**. Toda a minha profunda gratidão pela paciência, sabedoria e transmissão fidedigna do Dharma.


## 📜 Licença
*Tratado da Realização da Verdade* (Satyasiddhiśāstra).
Traduções e plataforma interativa.
