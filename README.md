<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=for-the-badge&logo=openai&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
</p>

<h1 align="center">🚀 CloudOps Copilot</h1>

<p align="center">
  <strong>Assistente inteligente de CloudOps/DevOps com interface web e API REST</strong><br/>
  Gera planos estruturados de deploy, segurança e troubleshooting para ambientes AWS com o poder da IA generativa.
</p>

<p align="center">
  <a href="http://3.144.142.200">🌐 Demo ao vivo</a> •
  <a href="#-como-rodar-localmente">⚡ Quick Start</a> •
  <a href="#-arquitetura">📐 Arquitetura</a> •
  <a href="#-stack-tecnológico-e-ferramentas">🛠 Stack</a>
</p>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Stack Tecnológico e Ferramentas](#-stack-tecnológico-e-ferramentas)
- [Estrutura de Diretórios](#-estrutura-de-diretórios)
- [Como Rodar Localmente](#-como-rodar-localmente)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Endpoints da API](#-endpoints-da-api)
- [Detalhamento do Código](#-detalhamento-do-código)
- [Roadmap](#-roadmap)
- [Autores](#-autores)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

O **CloudOps Copilot** é um assistente técnico web alimentado por IA (GPT-4o-mini) projetado para auxiliar profissionais de Cloud e DevOps em tarefas do dia a dia. A aplicação recebe descrições de cenários em linguagem natural e retorna planos técnicos estruturados em JSON, com passos executáveis, comandos CLI reais, estimativas de custo e alertas sobre problemas comuns.

O projeto foi desenvolvido com foco em arquitetura limpa, separação clara entre backend (API) e frontend (SPA), e boas práticas de versionamento com Git — servindo tanto como ferramenta funcional quanto como peça de portfólio profissional.

---

## ✨ Funcionalidades

**Gerador de Planos (Copilot)**
- Geração de planos de deploy, segurança e troubleshooting via IA
- Categorização por tipo: `deploy`, `security`, `troubleshooting`
- Resposta em JSON estruturado com passos, validações, custos e serviços estimados
- Campos dinâmicos por categoria (ex.: CDN/cache e HTTPS para deploys)

**Chatbot Multi-turno**
- Chat interativo com histórico de conversa mantido em memória
- Especialista em AWS, CI/CD, Docker, Kubernetes, Terraform e mais
- Renderização de Markdown na interface (código, listas, negrito)
- Indicador de status do servidor em tempo real (online/offline)

**Comunidade**
- Página de feedback comunitário com persistência em localStorage
- Sistema de votos, filtros por tipo (sugestão, bug, feedback, ideia) e moods
- Contadores animados de estatísticas

**Interface**
- Animação de partículas no background com Canvas API
- Scroll reveal com IntersectionObserver
- Menu drawer responsivo para mobile
- Design dark/neon com paleta cibernética

---

## 📐 Arquitetura

```
┌──────────────────────────────────────────────────────────┐
│                      FRONTEND (SPA)                      │
│  index.html  ─  chat.html  ─  comunidade.html            │
│  main.js     ─  chat.js    ─  comunidade.js               │
│  main.css    ─  chat.css   ─  comunidade.css               │
└────────────────────┬──────────────────┬──────────────────┘
                     │ HTTP POST        │ HTTP GET
                     ▼                  ▼
┌──────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                      │
│                                                          │
│  POST /generate-plan ──→ OpenAI GPT-4o-mini ──→ JSON     │
│  POST /chat          ──→ OpenAI GPT-4o-mini ──→ reply    │
│  GET  /health        ──→ status + key check               │
└──────────────────────────────────────────────────────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │  OpenAI API         │
          │  (GPT-4o-mini)      │
          └─────────────────────┘
```

A comunicação entre frontend e backend é feita via `fetch` (REST), com CORS habilitado. O backend atua como proxy inteligente para a OpenAI, injetando system prompts especializados e tratando erros de autenticação, rate limiting e parsing de JSON.

---

## 🛠 Stack Tecnológico e Ferramentas

### Backend — `api/`

| Ferramenta | Versão | Função dentro do Projeto |
|---|---|---|
| **Python** | 3.11+ | Linguagem principal do backend |
| **FastAPI** | 0.134.0 | Framework web assíncrono para construção da API REST. Define as rotas `/generate-plan`, `/chat` e `/health` com validação automática de schemas via Pydantic |
| **Uvicorn** | 0.41.0 | Servidor ASGI de alta performance que executa a aplicação FastAPI em produção e desenvolvimento (com `--reload` para hot-reload) |
| **Pydantic** | 2.12.5 | Validação e serialização de dados. Define os modelos `PlanRequest`, `ChatMessage` e `ChatRequest` que garantem que todas as requisições chegam com os campos corretos e tipados |
| **OpenAI SDK** | 2.24.0 | Client oficial da OpenAI para Python. Realiza as chamadas à API do GPT-4o-mini com system prompts customizados, controle de temperatura e max_tokens |
| **python-dotenv** | 1.2.1 | Carrega variáveis de ambiente do arquivo `.env` local, isolando a chave da API sem expô-la no código-fonte ou no repositório |
| **Starlete** | 0.52.1 | Framework ASGI subjacente ao FastAPI. Fornece o middleware CORS que permite requisições cross-origin do frontend |
| **HTTPX** | 0.28.1 | Cliente HTTP assíncrono utilizado internamente pelo OpenAI SDK para comunicação com a API da OpenAI |

### Frontend — `frontend/`

| Ferramenta | Função dentro do Projeto |
|---|---|
| **HTML5** | Estrutura semântica de 4 páginas: landing page (`index.html`), chat (`chat.html`), comunidade (`comunidade.html`) e "quem somos" (`quem-somos.html`) |
| **CSS3** | Estilização completa com design system dark/neon, animações CSS (keyframes, transitions), layout responsivo via media queries, variáveis CSS para paleta de cores |
| **JavaScript (Vanilla)** | Toda a lógica do frontend sem dependências externas — comunicação com API via `fetch`, renderização dinâmica do DOM, parsing de Markdown, gerenciamento de estado em memória |
| **Canvas API** | Sistema de partículas animadas no background da landing page (`main.js`), criando efeito visual com pontos flutuantes em cores neon |
| **IntersectionObserver API** | Scroll reveal progressivo — elementos com classe `.reveal` aparecem com animação conforme entram no viewport |
| **localStorage** | Persistência de dados da comunidade (posts e votos) no navegador do usuário, sem necessidade de banco de dados |

### Infraestrutura

| Ferramenta | Função dentro do Projeto |
|---|---|
| **AWS EC2** | Instância onde o backend e o frontend estão hospedados em produção (IP: `3.144.142.200`) |
| **Git/GitHub** | Versionamento com branches, commits semânticos e pull requests para revisão de código |

---

## 📁 Estrutura de Diretórios

```
CloudOps-copilot/
│
├── api/                          # Backend
│   ├── main.py                   # Aplicação FastAPI (rotas, prompts, lógica IA)
│   ├── requirements.txt          # Dependências Python
│   ├── _init_.py                 # Package marker
│   └── .env.example              # Template de variáveis de ambiente
│
├── frontend/                     # Interface Web
│   ├── index.html                # Landing page com o gerador de planos
│   ├── chat.html                 # Interface de chatbot multi-turno
│   ├── comunidade.html           # Página de feedback da comunidade
│   ├── quem-somos.html           # Página institucional dos autores
│   ├── curriculos/               # Curríoulos dos autores
│   ├── scripts/
│   │   ├── main.js               # Partículas, scroll reveal, drawer, copilot
│   │   ├── chat.js               # Chatbot: histórico, markdown, status
│   │   └── comunidade.js         # Feed, votos, filtros, localStorage
│   ├── styles/
│   │   ├── main.css              # Estilos da landing page
│   │   ├── chat.css              # Estilos do chatbot
│   │   └── comunidade.css        # Estilos da comunidade
│   └── assets/
│       └── home-bg.jpg           # Imagem de fundo da landing page
│
├── .gitignore
└── README.md
```

---

## ⚡ Como Rodar Localmente

### Pré-requisitos

- Python 3.11+
- Uma chave de API da OpenAI ([obter aqui](https://platform.openai.com/api-keys))

### 1. Clonar o Repositório

```bash
git clone https://github.com/ognistie/CloudOps-copilot.git
cd CloudOps-copilot
```

### 2. Criar e Ativar Ambiente Virtual

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Instalar Dependências

```bash
cd api
pip install -r requirements.txt
```

### 4. Configurar Variáveis de Ambiente

```bash
# Crie o arquivo .env dentro da pasta api/
echo "OPENAI_API_KEY=sk-sua-chave-aqui" > .env
```

### 5. Iniciar a API

```bash
uvicorn main:app --reload
```

A API estará disponível em `http://127.0.0.1:8000` e a documentação interativa (Swagger) em `http://127.0.0.1:8000/docs`.

### 6. Iniciar o Frontend

```bash
cd ../frontend
python -m http.server 5500
```

Acesse `http://localhost:5500` no navegador.

> **Nota:** para rodar localmente, altere a URL da API nos arquivos `scripts/main.js` e `scripts/chat.js` de `http://3.144.142.200:8000` para `http://127.0.0.1:8000`.

---

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|---|---|---|
| `OPENAI_API_KEY` | Chave de API da OpenAI para acesso ao GPT-4o-mini | Sim |

O arquivo `.env` deve estar na pasta `api/` e **nunca** deve ser commitado no repositório (já incluído no `.gitignore`).

---

## 📡 Endpoints da API

### `GET /health`

Verifica o status do servidor e se a chave da OpenAI está carregada.

**Resposta:**
```json
{
  "status": "ok",
  "key_loaded": true,
  "key_prefix": "sk-proj-xxxx",
  "env_path": "/path/to/api/.env",
  "env_exists": true
}
```

### `POST /generate-plan`

Gera um plano técnico estruturado com base na categoria e descrição do cenário.

**Body:**
```json
{
  "category": "deploy",
  "input": "Deploy de aplicação React no S3 com CloudFront"
}
```

**Resposta:** JSON com `title`, `summary`, `decision`, `assumptions`, `architecture`, `steps`, `validation`, `cost_notes`, `common_issues` e `estimated_services`. Para a categoria `deploy`, inclui campos adicionais de `cdn_cache` e `https_domain`.

### `POST /chat`

Envia mensagens para o chatbot mantendo contexto multi-turno.

**Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Como configurar um ALB na AWS?" }
  ]
}
```

**Resposta:**
```json
{
  "reply": "Para configurar um ALB na AWS..."
}
```

---

## 🔍 Detalhamento do Código

### `api/main.py` — Cérebro da Aplicação

O arquivo concentra toda a lógica do backend em ~260 linhas. Os principais blocos são:

**Inicialização e configuração** (linhas 1–32): Carrega as dependências, configura o logging para debug, lê o `.env` com `python-dotenv`, inicializa o FastAPI com CORS liberado (necessário para o frontend acessar a API de outro domínio/porta).

**System Prompts** (linhas 71–220): Dois prompts de sistema cuidadosamente elaborados definem o comportamento da IA. O `SYSTEM_PROMPT` do gerador de planos contém regras absolutas de formatação (responder somente JSON, sem rodeios, sem templates genéricos) e um mapeamento de decisões técnicas (SPA → S3+CloudFront, DDoS → Shield+WAF, etc.). O `CHAT_SYSTEM_PROMPT` define as especialidades do chatbot cobrindo 9 domínios AWS/DevOps.

**Rota `/generate-plan`** (linhas 100–185): Recebe categoria e input do usuário, monta um prompt dinâmico com template JSON, envia para o GPT-4o-mini com `temperature=0.4` (respostas mais determinísticas) e `max_tokens=1800`, extrai o JSON da resposta com `extract_json()` (que faz fallback com regex caso a IA inclua texto antes/depois do JSON), e retorna o plano estruturado.

**Rota `/chat`** (linhas 223–262): Recebe o histórico completo de mensagens (multi-turno), injeta o system prompt, envia para o GPT-4o-mini com `temperature=0.5` (um pouco mais criativo que o gerador de planos) e retorna a resposta como texto.

**Tratamento de erros**: Ambas as rotas capturam `AuthenticationError` (chave inválida → 401), `RateLimitError` (limite atingido → 429), `JSONDecodeError` (resposta inválida → 500) e exceções genéricas, retornando mensagens claras em português.

### `frontend/scripts/main.js` — Landing Page Interativa

**Partículas** (linhas 1–57): Cria um sistema de 90 partículas animadas via Canvas 2D. Cada partícula tem posição, velocidade, opacidade e cor aleatória (rosa neon, ciano ou laranja). O loop de animação roda com `requestAnimationFrame` para performance otimizada.

**Scroll Reveal** (linhas 60–86): Usa `IntersectionObserver` com threshold de 8% para detectar quando elementos `.reveal` entram no viewport e adiciona a classe `.on` que ativa a animação CSS. Fallback de 600ms garante que elementos apareçam mesmo se o observer falhar.

**Mobile Drawer** (linhas 89–106): Menu lateral responsivo com abrir/fechar, backdrop e fechamento automático ao clicar em links.

**Copilot UI** (linhas 109–229): Gerencia a seleção de categoria por chips, faz a chamada `POST` para `/generate-plan`, e renderiza o plano retornado em cards HTML com seções colapsáveis (premissas, arquitetura, passos, validação, custos, problemas comuns e serviços estimados).

### `frontend/scripts/chat.js` — Chatbot Completo

**Gerenciamento de estado** (linhas 20–25): Mantém o histórico de conversa em array `history[]` e flag `isLoading` para prevenir envios duplicados.

**Health check** (linhas 28–39): Verifica se a API está online e se a chave OpenAI está carregada, atualizando o indicador visual de status.

**Parser Markdown** (linhas 96–117): Converte blocos de código, código inline, negrito, itálico, títulos (h2-h4), listas e quebras de linha em HTML para renderização rica nas respostas do bot.

**Fluxo de mensagem** (linhas 189–256): Ao enviar, adiciona a mensagem do usuário ao DOM e ao histórico, exibe o indicador de digitação ("pensando..."), faz o `POST` para `/chat` com todo o histórico, e renderiza a resposta com Markdown. Em caso de erro, remove a última mensagem do histórico (rollback) e exibe mensagem de erro estilizada.

### `frontend/scripts/comunidade.js` — Sistema de Feedback

**Persistência** (linhas 48–51): Usa `localStorage` com duas chaves separadas — uma para posts e outra para votos — com serialização JSON.

**Feed interativo** (linhas 165–177): Filtra posts por tipo, ordena por votos (descendente) e timestamp, e renderiza cards com avatar, mood (emoji SVG), badge de tipo, mensagem e botão de voto.

**Sistema de votos** (linhas 146–163): Toggle de voto (curtir/descurtir) com persistência imediata e animação no contador.

---

## 📈 Roadmap

- [ ] Autenticação de usuários
- [ ] Rate limiting no backend
- [ ] Streaming de respostas (SSE)
- [ ] CI/CD com GitHub Actions
- [ ] Testes automatizados (pytest + Playwright)
- [ ] Deploy containerizado com Docker
- [ ] Suporte a múltiplos provedores cloud (Azure, GCP)

---

## 👨‍💻 Autores

**Guilherme Moraes Franco**
[![GitHub](https://img.shields.io/badge/GitHub-ognistie-181717?style=flat&logo=github)](https://github.com/ognistie)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Guilherme_Franco-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/guilherme-moraes-franco-b4b1a0353/)
📧 og.guifranco@gmail.com

**Gabriel Moraes Franco**
[![GitHub](https://img.shields.io/badge/GitHub-BielmFranco-181717?style=flat&logo=github)](https://github.com/BielmFranco)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Gabriel_Franco-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/gabriel-moraes-franco-935453352/)
📧 gabrielmoraesprincipe@gmail.com

---

## 📜 Licença

Projeto desenvolvido para fins educacionais e portfólio.
