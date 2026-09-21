# Code Reviewer — Notas do projeto

Resumo do que foi construído e decidido, para retomar o trabalho mesmo sem o histórico da conversa. Data da última sessão: 2026-09-18.

## O que é o projeto

Sistema de revisão de código que combina **análise estática** (ESLint/Ruff) com **análise por IA**, usando o contexto do projeto (descrição, arquitetura, convenções) e **regras de negócio** cadastradas pelo usuário como fonte de verdade. A IA não pode inventar regras nem reinterpretá-las — só pode comparar o código com o que foi cadastrado e pedir esclarecimento quando houver dúvida.

Especificação original: `Documento sem título.pdf` (não está no repo, foi só a base inicial da conversa).

## Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Monaco Editor (`apps/web`)
- **Backend**: Node.js + TypeScript + Express (`apps/api`)
- **Banco**: PostgreSQL + Prisma (rodando via Docker Compose)
- **IA**: Groq (`openai/gpt-oss-120b`, camada gratuita), via `groq-sdk`
- **Monorepo**: npm workspaces (`apps/web`, `apps/api`, `packages/shared`)

## Como rodar

```bash
# na raiz do projeto (C:\Users\Henri\Desktop\CodeRV)
npm install
docker compose up -d          # sobe o Postgres (precisa do Docker Desktop aberto)

# apps/api/.env precisa ter:
#   DATABASE_URL, JWT_SECRET, WEB_ORIGIN, LLM_API_KEY (chave do Groq)

cd apps/api && npx prisma migrate dev   # só na primeira vez / após mudar o schema
npm run dev:api    # roda a API na porta 3333 (a partir da raiz)
npm run dev:web    # roda o front na porta 5173 (a partir da raiz)
```

**Cuidado conhecido**: nesta sessão, reiniciar os servidores várias vezes seguidas às vezes deixou processos `node` "zumbis" presos em portas antigas (erro `EADDRINUSE` silencioso). Se a API ou o front parecerem estar rodando código antigo, mate todos os processos `node.exe` órfãos e suba de novo do zero.

## Decisões de arquitetura (schema)

- **Regras ↔ código**: híbrido — regras globais (sempre no contexto da IA) + regras com escopo por glob pattern (campo `scope` em `RuleVersion`).
- **Times**: todo projeto pertence a um `Team`; usuários entram em times via `TeamMember` (roles `OWNER`/`MEMBER`). No registro, cada usuário já ganha um time pessoal automaticamente.
- **Versionamento**: histórico completo — `Rule`/`RuleVersion` versionadas (nunca editadas in-place), e cada `Analysis` guarda quais `RuleVersion`s estavam em vigor (`AnalysisRuleVersion`).
- **Análise estática plugável**: interface `Analyzer` em `apps/api/src/modules/analysis/analyzers/`, com `EslintAnalyzer` (JS/TS, via API do próprio ESLint) e `RuffAnalyzer` (Python, via subprocess — degrada graciosamente se o binário `ruff` não estiver instalado).
- **Interatividade**: achados de severidade **ALTA** com dúvida em aberto (`needsClarification`) bloqueiam (`isBlocking`) até o usuário responder; os demais não bloqueiam.
- **Contexto permanente**: respostas de esclarecimento podem virar `ContextEntry` (entidade própria, não texto solto), rastreável até o achado que a originou.

## Módulos do backend (`apps/api/src/modules`)

- `auth`: registro/login/logout/me, senha com bcrypt, JWT em **cookie httpOnly** (não em localStorage — migrado por segurança).
- `teams`: CRUD de times, adicionar membro por e-mail.
- `projects`: CRUD, contexto (descrição, objetivo, tecnologias, `supportedLanguages`, arquitetura, convenções, info adicional).
- `rules`: regras versionadas, com escopo opcional.
- `context`: `ContextEntry`s (contexto permanente confirmado).
- `analysis`: o núcleo — orquestra analisador estático + IA, calcula bloqueio, valida `ruleIdentifier` da IA contra regras reais, filtra achados de IA duplicados dos estáticos, expõe clarify/dispute.

## Segurança (revisão de código feita nesta sessão)

Achados corrigidos: IDOR em clarify/dispute (finding não pertencia à análise informada), IDOR em `ContextEntry.sourceFindingId`, falta de error handler global (`express-async-errors` + middleware), race conditions em registro/regras/times (captura de `P2002` do Prisma), JWT sem allow-list de algoritmo, e a migração de JWT de `localStorage` para cookie `httpOnly`.

Antes de colocar a IA de verdade, também foi adicionado: limite de tamanho no código enviado (50k caracteres), rate limiting nos endpoints que chamam IA (15/15min por usuário), timeout de 60s na chamada à LLM, e o filtro de duplicata + sanitização de `ruleIdentifier` mencionados acima.

## IA (Groq)

- Modelo: `openai/gpt-oss-120b` (gratuito, suporta JSON Schema estrito — a resposta é validada estruturalmente pelo próprio provedor, não só por instrução de prompt).
- **Limitação conhecida do modelo gratuito**: às vezes ignora a instrução de "não duplicar achados estáticos" e às vezes erra a escala de `confidence` (0–100) entre uma chamada e outra — isso é inconsistência do modelo, não bug do código. O filtro de duplicata no backend (`sanitize-ai-finding.ts`) cobre a duplicação de forma determinística; a calibração de confiança não tem solução 100% garantida via prompt.
- Chave (`LLM_API_KEY`) fica em `apps/api/.env` — **nunca cole chaves de API direto no chat**, edite o `.env` direto.

## Frontend

- Autenticação via cookie httpOnly (contexto `AuthContext`, checa sessão com `GET /auth/me` no boot).
- Editor de código: Monaco (`@monaco-editor/react`).
- Design: inspirado na paleta da McLaren F1 — preto (`carbon`) como fundo do app inteiro, laranja "papaya" como cor de destaque/botões, cards brancos "flutuando" por cima. Sem elementos temáticos de corrida (só a paleta de cores).
- Componentes reutilizáveis: `Button` (pílula, variantes) e `Card` (polimórfico via `as`, cuidado ao usar com `<li>`/`<details>` para não gerar HTML inválido).
- Legenda explicando severidade/classificação/confiança/origem na tela de resultados da análise.

## O que falta / possíveis próximos passos

- Nada crítico pendente — o fluxo completo (cadastro → time → projeto → contexto → regras → análise com IA real → esclarecimento/disputa) está funcional e testado.
- Ideias para depois, se quiser: histórico de análises anteriores na UI (hoje só mostra a última rodada), upload de arquivo de código (a spec original menciona isso além de colar no editor), suporte a mais linguagens, tela de gerenciamento de membros do time.
