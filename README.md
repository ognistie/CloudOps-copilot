# 🚀 CloudOps Copilot

CloudOps Copilot é um assistente web + API desenvolvido para auxiliar em tarefas de CloudOps/DevOps, gerando planos estruturados para deploy, segurança, troubleshooting e boas práticas em ambientes cloud.

Projeto desenvolvido com foco em:

- Arquitetura limpa
- Organização profissional
- Boas práticas de versionamento
- Estrutura pronta para evolução e deploy

---

## 📌 Objetivo

Criar uma base sólida de um "copilot técnico" capaz de:

- Gerar planos de deploy
- Orientar boas práticas de segurança
- Ajudar na resolução de problemas
- Simular fluxos reais de CloudOps

---

## 🏗 Arquitetura do Projeto
cloudops-copilot/
│
├── api/ # Backend (FastAPI)
│ ├── main.py
│ ├── requirements.txt
│ └── .env.example
│
├── frontend/ # Interface Web
│ ├── index.html
│ ├── chat.html
│ ├── scripts/
│ ├── styles/
│ └── assets/
│
└── .gitignore 

---

## ⚙️ Tecnologias Utilizadas

### Backend
- Python 3.11+
- FastAPI
- Uvicorn
- Pydantic
- OpenAI SDK

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` dentro da pasta `api/` baseado no modelo:
OPENAI_API_KEY=sua_chave_aqui 

O arquivo real `.env` **não deve ser enviado ao GitHub**.

---

## 🖥 Como Rodar o Projeto Localmente

### 1️⃣ Clonar o repositório
git clone https://github.com/ognistie/CloudOps-copilot.git

cd CloudOps-copilot 

---

### 2️⃣ Criar ambiente virtual

Windows:
python -m venv .venv
..venv\Scripts\activate

Linux/Mac:

python3 -m venv .venv
source .venv/bin/activate

---

### 3️⃣ Instalar dependências

cd api
pip install -r requirements.txt

---

### 4️⃣ Rodar a API
uvicorn main:app --reload 

Acesse:
- API: http://127.0.0.1:8000
- Docs: http://127.0.0.1:8000/docs

---

### 5️⃣ Rodar o Frontend

Abra `frontend/index.html` com Live Server ou:
cd frontend
python -m http.server 5500

---

## 💡 Exemplos de Uso

### Deploy
- Criar plano de deploy para aplicação FastAPI
- Checklist para publicar frontend + backend

### Security
- Checklist de segurança para APIs
- Boas práticas de variáveis de ambiente

### Troubleshooting
- Diagnóstico de erro 500
- Problemas de CORS
- Timeout em requisições fetch

---

## 📈 Roadmap

- [ ] Melhorar tratamento de erros
- [ ] Adicionar autenticação
- [ ] Implementar rate limiting
- [ ] Deploy em ambiente cloud
- [ ] CI/CD com GitHub Actions

---

## 🤝 Colaboração

Projeto versionado com boas práticas de Git:

- Uso de branches
- Commits semânticos
- Pull Requests para revisão

---

## 👨‍💻 Autorws

Guilherme Moraes Franco  
📧 og.guifranco@gmail.com 
🔗 https://github.com/ognistie 
🔗 https://www.linkedin.com/in/guilherme-moraes-franco-b4b1a0353/?skipRedirect=true

Gabriel Moraes Franco  
📧 gabrielmoraesprincipe@gmail.com
🔗 https://www.linkedin.com/in/gabriel-moraes-franco-935453352/

---

## 📜 Licença

Projeto para fins educacionais e portfólio.

