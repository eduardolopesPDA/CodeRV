# CodeRV

O CodeRV é um sistema de revisão de código para desenvolvedores solo e times, que combina **análise estática** (ESLint/Ruff) com **análise por IA**. A IA usa o contexto do projeto (descrição, arquitetura, convenções) e as **regras de negócio** cadastradas pelo usuário como única fonte de verdade — ela não inventa nem reinterpreta regras, apenas compara o código com o que foi cadastrado e pede esclarecimento quando há dúvida.

## Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Monaco Editor (`apps/web`)
- **Backend**: Node.js + TypeScript + Express (`apps/api`)
- **Banco de dados**: PostgreSQL + Prisma (via Docker Compose)
- **IA**: Groq (`openai/gpt-oss-120b`), via `groq-sdk`
- **Monorepo**: npm workspaces (`apps/web`, `apps/api`, `packages/shared`)

## Como funciona

- Todo projeto pertence a um **time** (`Team`); usuários entram em times como `OWNER` ou `MEMBER`, e cada novo usuário já ganha um time pessoal no registro.
- As **regras de negócio** são versionadas (`Rule` → `RuleVersion`, nunca editadas in-place) e podem ser globais ou restritas a arquivos via glob pattern.
- Cada análise combina um **analisador estático plugável** (ESLint para JS/TS, Ruff para Python — degrada graciosamente se o binário não estiver instalado) com a revisão da IA.
- Achados de severidade **ALTA** com dúvida em aberto bloqueiam a análise até o usuário responder; respostas de esclarecimento podem virar contexto permanente do projeto (`ContextEntry`), rastreável até o achado que a originou.

## Como rodar localmente

```bash
# na raiz do projeto
npm install
docker compose up -d          # sobe o Postgres (precisa do Docker Desktop aberto)
```

Crie `apps/api/.env` a partir de `apps/api/.env.example` e preencha:

- `DATABASE_URL`, `JWT_SECRET`, `WEB_ORIGIN`
- `LLM_API_KEY` — chave da [Groq](https://console.groq.com) (camada gratuita)

```bash
cd apps/api && npx prisma migrate dev   # só na primeira vez / após mudar o schema

# de volta na raiz
npm run dev:api    # API em http://localhost:3333
npm run dev:web    # frontend em http://localhost:5173
```

## Estrutura

```
apps/
  api/        # Express + Prisma — auth, teams, projects, rules, context, analysis
  web/        # React + Vite + Tailwind — UI de projetos, regras e análise
packages/
  shared/     # tipos compartilhados entre web e api
```

Mais detalhes de decisões de arquitetura e do histórico de desenvolvimento estão em [NOTES.md](NOTES.md).
