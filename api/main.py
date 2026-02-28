from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from openai import OpenAI, RateLimitError, AuthenticationError
import os
from pathlib import Path
import json
import re
import logging

# ── Logging para debug no terminal ──────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cloudops")

# ── Carrega .env da mesma pasta que main.py ──────────────────
env_path = Path(__file__).with_name(".env")
logger.info(f"Carregando .env de: {env_path} | existe: {env_path.exists()}")
load_dotenv(dotenv_path=env_path, override=True)

API_KEY = os.getenv("OPENAI_API_KEY", "")
logger.info(f"OPENAI_API_KEY carregada: {bool(API_KEY)} | primeiros chars: {API_KEY[:12] if API_KEY else 'VAZIA'}")

app = FastAPI(title="CloudOps Copilot API", version="0.5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Client criado após load_dotenv (garante que a chave já foi lida)
def get_client():
    key = os.getenv("OPENAI_API_KEY", "")
    if not key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY não encontrada. Verifique o arquivo .env na pasta do main.py.")
    return OpenAI(api_key=key)


class PlanRequest(BaseModel):
    category: str = Field(..., examples=["deploy"])
    input: str = Field(..., min_length=3)


@app.get("/health")
def health():
    key = os.getenv("OPENAI_API_KEY", "")
    return {
        "status": "ok",
        "key_loaded": bool(key),
        "key_prefix": key[:12] if key else "VAZIA",
        "env_path": str(Path(__file__).with_name(".env")),
        "env_exists": Path(__file__).with_name(".env").exists()
    }


# ── Helpers ─────────────────────────────────────────────────
def extract_json(text: str):
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            return json.loads(match.group(0))
        raise


# ── System Prompt ────────────────────────────────────────────
SYSTEM_PROMPT = """
Você é o CloudOps Copilot, mentor sênior de AWS/DevOps.
Responda SEMPRE em PT-BR.
Seu objetivo é entregar um plano técnico PRECISO, DECIDIDO e EXECUTÁVEL.

REGRAS ABSOLUTAS:
1. NUNCA repita ou ecoe o pedido do usuário na resposta.
2. NUNCA comece com "Você quer...", "Entendi que...", "Com base no seu pedido...".
3. Vá direto ao plano — sem introdução, sem rodeios.
4. Cada resposta deve ser ESPECÍFICA ao pedido do usuário, não um template genérico.
5. Se o pedido mencionar um serviço, tecnologia ou problema específico, o plano DEVE refletir isso.
6. Proibido responder com "OU", "depende", "pode ser" sem antes decidir um caminho claro.
7. Evite teoria: foque em console/CLI/checklist, validação e erros comuns reais.
8. Retorne SOMENTE JSON válido — sem markdown, sem texto fora do JSON, sem ```json.

REGRAS DE ESCOLHA TÉCNICA:
- SPA React estático → S3 + CloudFront + ACM + Route 53
- SSR / Next.js → Amplify ou ECS Fargate (justifique no campo decision)
- DDoS / WAF → AWS Shield Standard + AWS WAF + Rate Limiting no API Gateway
- IAM / Segurança → Least privilege + MFA + CloudTrail + SCPs + GuardDuty
- Monitoramento → CloudWatch + X-Ray + Dashboards + Alarmes SNS
- Custos → Cost Explorer + Budgets + Tags obrigatórias + Savings Plans
- Segurança EC2 → Security Groups restritivos + SSM Session Manager + IMDSv2 + CW Agent
- Se não especificado → assuma o padrão mais seguro e econômico para o contexto

LEMBRE-SE: o plano deve ser DIFERENTE e ESPECÍFICO para cada pedido recebido.
"""


@app.post("/generate-plan")
def generate_plan(request: PlanRequest):
    client = get_client()

    optional_fields = ""
    if request.category == "deploy":
        optional_fields = """
  "cdn_cache": {
    "default_ttl_seconds": 3600,
    "index_ttl_seconds": 0,
    "immutable_assets_ttl_seconds": 604800,
    "compression": true,
    "invalidation": "descreva a estratégia"
  },
  "https_domain": {
    "certificate_provider": "ACM",
    "acm_region": "us-east-1",
    "dns": "Route 53 ou CNAME",
    "notes": "observações importantes"
  },"""

    user_prompt = f"""Categoria: {request.category}
Pedido: {request.input}

Analise o pedido ACIMA e gere um plano ESPECÍFICO para esse cenário.
Retorne APENAS o JSON abaixo preenchido com dados reais para ESTE pedido:

{{
  "category": "{request.category}",
  "title": "título específico para este pedido",
  "summary": "1-2 frases descrevendo a solução escolhida",
  "decision": "Vou usar [serviços] porque [razão técnica concreta]",
  "assumptions": ["premissa 1", "premissa 2"],
  "architecture": ["componente 1 com papel claro", "componente 2"],
  "steps": [
    {{"title": "passo 1", "type": "console", "actions": ["ação detalhada"], "expected": "resultado"}},
    {{"title": "passo 2", "type": "cli", "actions": ["comando AWS CLI real"], "expected": "resultado"}}
  ],{optional_fields}
  "validation": ["como testar que funcionou", "outra verificação"],
  "cost_notes": ["estimativa de custo real"],
  "common_issues": ["erro comum deste cenário", "outro problema frequente"],
  "estimated_services": ["ServiçoA", "ServiçoB"]
}}"""

    logger.info(f"Chamando OpenAI | categoria={request.category} | input={request.input[:60]}")

    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.4,
            max_tokens=1800,
        )

        content = resp.choices[0].message.content or ""
        logger.info(f"Resposta OpenAI recebida | tamanho={len(content)} chars")
        data = extract_json(content)
        return data

    except AuthenticationError as e:
        logger.error(f"Erro de autenticação OpenAI: {e}")
        raise HTTPException(
            status_code=401,
            detail=f"Chave da OpenAI inválida ou expirada. Verifique sua API Key. Erro: {str(e)}"
        )

    except RateLimitError as e:
        logger.error(f"Rate limit OpenAI: {e}")
        raise HTTPException(
            status_code=429,
            detail="Limite de requisições da OpenAI atingido. Aguarde alguns segundos e tente novamente."
        )

    except json.JSONDecodeError as e:
        logger.error(f"JSON inválido da OpenAI: {e}")
        raise HTTPException(
            status_code=500,
            detail="A IA não retornou JSON válido. Tente novamente com uma descrição mais detalhada."
        )

    except Exception as e:
        logger.error(f"Erro inesperado: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")


# ── Chat Model ───────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str   # "user" ou "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(..., min_length=1)

# ── System Prompt do Chatbot ─────────────────────────────────
CHAT_SYSTEM_PROMPT = """
Você é o CloudOps Copilot, assistente sênior especialista em Cloud & DevOps.
Responda SEMPRE em PT-BR com linguagem técnica clara e direta.

ESPECIALIDADES:
- AWS (EC2, S3, CloudFront, RDS, Lambda, ECS, EKS, API Gateway, Route53, ACM, IAM, WAF, Shield, CloudWatch, X-Ray, CodePipeline, CodeBuild)
- DevOps (CI/CD, GitHub Actions, Docker, Kubernetes, Terraform, Ansible)
- Segurança (IAM least privilege, MFA, CloudTrail, GuardDuty, WAF, Shield, SCPs)
- Observabilidade (CloudWatch, X-Ray, Prometheus, Grafana, ELK)
- Custos (Cost Explorer, Budgets, Savings Plans, Reserved Instances, Spot)
- Serverless (Lambda, API Gateway, DynamoDB, SQS, SNS, EventBridge)
- Containers (Docker, ECS, EKS, ECR, Fargate)
- Bancos de dados (RDS, Aurora, DynamoDB, ElastiCache, Redshift)
- Redes (VPC, Subnets, Security Groups, NACLs, Transit Gateway, Direct Connect)

REGRAS DE COMPORTAMENTO:
1. Seja direto e objetivo — vá direto à resposta técnica.
2. Use exemplos de comandos CLI quando relevante.
3. Mencione custos estimados quando perguntado.
4. Se houver múltiplas opções, escolha a melhor e explique brevemente o porquê.
5. Use formatação markdown: **negrito**, `código`, listas com -.
6. Mantenha o contexto da conversa — lembre o que foi discutido antes.
7. Se a pergunta não for sobre Cloud/DevOps, redirecione gentilmente para sua especialidade.
"""

# ── Rota /chat ───────────────────────────────────────────────
@app.post("/chat")
def chat(request: ChatRequest):
    client = get_client()

    # Monta o histórico para a OpenAI
    messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}]
    for msg in request.messages:
        if msg.role in ("user", "assistant"):
            messages.append({"role": msg.role, "content": msg.content})

    logger.info(f"Chat | {len(request.messages)} mensagens no histórico")

    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.5,
            max_tokens=1200,
        )

        reply = resp.choices[0].message.content or ""
        logger.info(f"Chat resposta | {len(reply)} chars")
        return {"reply": reply}

    except AuthenticationError as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(
            status_code=401,
            detail="Chave da OpenAI inválida ou expirada. Adicione créditos em platform.openai.com"
        )

    except RateLimitError as e:
        logger.error(f"Rate limit: {e}")
        raise HTTPException(
            status_code=429,
            detail="Limite de requisições atingido. Aguarde alguns segundos e tente novamente."
        )

    except Exception as e:
        logger.error(f"Erro no chat: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")