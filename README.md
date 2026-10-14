# CodeRV

O CodeRV é um sistema de revisão de código para desenvolvedores solo e times, que combina **análise estática** (ESLint/Ruff) com **análise por IA**. A IA usa o contexto do projeto (descrição, arquitetura, convenções) e as **regras de negócio** cadastradas pelo usuário como única fonte de verdade — ela não inventa nem reinterpreta regras, apenas compara o código com o que foi cadastrado e pede esclarecimento quando há dúvida.

## Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Monaco Editor + TanStack Query (`apps/web`)
- **Backend**: Node.js + TypeScript + Express (`apps/api`)
- **Banco de dados**: PostgreSQL + Prisma (via Docker Compose)
- **IA**: Groq (`openai/gpt-oss-120b`), via `groq-sdk`
- **Monorepo**: npm workspaces (`apps/web`, `apps/api`, `packages/shared`)

## Como funciona

- Todo projeto pertence a um **time** (`Team`); usuários entram em times como `OWNER` ou `MEMBER`, e cada novo usuário já ganha um time pessoal no registro.
- As **regras de negócio** são versionadas (`Rule` → `RuleVersion`, nunca editadas in-place) e podem ser globais ou restritas a arquivos via glob pattern.
- Cada análise combina um **analisador estático plugável** (ESLint para JS/TS, Ruff para Python — degrada graciosamente se o binário não estiver instalado) com a revisão da IA.
- Achados de severidade **ALTA** com dúvida em aberto bloqueiam a análise até o usuário responder; respostas de esclarecimento podem virar contexto permanente do projeto (`ContextEntry`), rastreável até o achado que a originou.

## Como rodar

```bash
npm install
docker compose up -d          # sobe o Postgres (precisa do Docker Desktop aberto)

# apps/api/.env precisa ter:
#   DATABASE_URL, JWT_SECRET, WEB_ORIGIN, LLM_API_KEY (chave do Groq)

cd apps/api && npx prisma migrate dev   # só na primeira vez / após mudar o schema
npm run dev:api    # API na porta 3333
npm run dev:web    # front na porta 5173
```

O frontend lê `VITE_API_URL` (opcional); sem ela, assume `http://localhost:3333`.

Comandos do `apps/web`:

```bash
npm run dev        # vite
npm run typecheck  # tsc --noEmit
npm run build      # tsc -b && vite build
```

## Frontend (`apps/web`)

Reescrito por completo com design system próprio (dark studio + acento papaya), tokens no `tailwind.config.js`, primitivos em `src/components/ui` e feature modules em `src/features`.

- **Rotas**: `/login`, `/register`, `/projects`, `/projects/:id/(revisao|regras|contexto)`, `/times`. As abas do projeto são rotas — a URL é compartilhável e o botão voltar funciona.
- **Estado de servidor**: TanStack Query, com keys em `src/lib/query/keys.ts`.
- **API**: `src/lib/api/*`, com `ApiError` que absorve tanto `{ error: "CODE" }` quanto o `flatten()` do Zod.
- **Análise**: o rascunho de código fica em `localStorage` por projeto (trocar de aba não perde o editor) e o histórico local guarda os ids das últimas análises.
- **Monaco**: tema escuro custom (`coderv`) em `src/components/code/CodeEditor.tsx`.

Ver `NOTES.md` para decisões de arquitetura e o restante do contexto do projeto.
