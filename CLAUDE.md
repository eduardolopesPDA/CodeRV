# CLAUDE.md

Este arquivo orienta o Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## O que é este projeto

CodeRV (nome interno `code-reviewer`) é um sistema de revisão de código que combina **análise estática** (ESLint/Ruff) com **análise por IA**. A IA usa o contexto do projeto (descrição, arquitetura, convenções) e as **regras de negócio** cadastradas pelo usuário como única fonte de verdade — ela não pode inventar regras nem reinterpretá-las, só comparar o código com o que foi cadastrado e pedir esclarecimento quando houver dúvida. Essa restrição molda o módulo de análise — ver "Pipeline de análise" abaixo.

## Comandos

Rodar a partir da raiz do repositório, exceto quando indicado.

```bash
npm install
docker compose up -d              # sobe o Postgres (precisa do Docker Desktop aberto)
cd apps/api && npx prisma migrate dev   # só na primeira vez / após mudar prisma/schema.prisma

npm run dev:api                   # API em http://localhost:3333
npm run dev:web                   # frontend em http://localhost:5173
```

Comandos por workspace (rodar dentro de `apps/api` ou `apps/web`, ou via `--workspace=`):
- `npm run build` — `apps/api`: `tsc -p tsconfig.json`; `apps/web`: `tsc -b && vite build`
- `apps/api`: `npm run prisma:generate`, `npm run prisma:migrate`
- `apps/web`: `npm run preview`

Nenhum workspace tem script de lint ou de testes configurado — não assuma que `npm test`/`npm run lint` existem.

`apps/api/.env` precisa ser criado a partir de `apps/api/.env.example`, preenchendo `DATABASE_URL`, `JWT_SECRET`, `WEB_ORIGIN` e `LLM_API_KEY` (chave gratuita da Groq, em console.groq.com). Nunca cole chaves de API no chat/código — edite o `.env` diretamente.

**Cuidado conhecido**: reiniciar os servidores de dev várias vezes seguidas pode deixar processos `node.exe` "zumbis" presos em portas antigas (`EADDRINUSE` silencioso). Se a API ou o front parecerem estar rodando código antigo, mate os processos `node.exe` órfãos e suba tudo de novo.

## Arquitetura

Monorepo via npm workspaces: `apps/api` (Express + TypeScript), `apps/web` (React + Vite + Tailwind), `packages/shared` (tipos compartilhados entre os dois, importado como `@code-reviewer/shared`).

### Módulos do backend (`apps/api/src/modules/*`)

Cada módulo segue o par `*.routes.ts` + `*.service.ts` (routes cuidam de HTTP/validação, services concentram a lógica). Módulos: `auth`, `teams`, `projects`, `rules`, `context`, `analysis`. Infra transversal fica em `apps/api/src/infra` (`error-handler.ts` — handler global via `express-async-errors`; `prisma/client.ts`).

- **auth**: registro/login/logout/me. Senha com bcrypt; JWT guardado em **cookie httpOnly** (não em localStorage — foi uma migração deliberada por segurança, não reverter).
- **teams**: todo `Project` pertence a um `Team`; usuários entram via `TeamMember` com role `OWNER`/`MEMBER`. Todo novo usuário já ganha um time pessoal automaticamente no registro.
- **rules**: regras de negócio são versionadas e nunca editadas in-place — `Rule` → `RuleVersion` (único em `[ruleId, version]`). Uma `RuleVersion` pode ser global ou ter escopo por glob pattern (campo `scope`, comparado com `minimatch`).
- **context**: registros de `ContextEntry` são contexto permanente confirmado a partir de respostas de esclarecimento; cada um pode ser rastreado até o `Finding` que o originou (`sourceFindingId`).
- **analysis**: o módulo central de orquestração (ver abaixo).

### Pipeline de análise (`apps/api/src/modules/analysis`)

Uma execução de `Analysis` combina um analisador estático plugável com um revisor de IA e depois concilia os dois:

- `analyzers/analyzer.interface.ts` define o contrato `Analyzer`; `eslint.analyzer.ts` (JS/TS, via a própria API do ESLint) e `ruff.analyzer.ts` (Python, via subprocess) o implementam. Analisadores devem degradar graciosamente se a ferramenta/binário não estiver instalado — não transformar isso em falha dura.
- `ai/` contém a integração com a Groq: `llm-client.ts`, `prompt.ts` (monta o contexto do projeto + regras ativas), `schema.ts` (JSON Schema estrito validado na resposta do modelo), `ai-analyzer.ts`.
- `sanitize-ai-finding.ts` filtra de forma determinística achados de IA que duplicam achados da análise estática e valida o `ruleIdentifier` da IA contra as regras reais cadastradas — a IA não pode referenciar uma regra que não existe. Esse filtro é a correção determinística para a tendência conhecida do LLM de duplicar achados ou errar a escala de `confidence` (0–100); essa inconsistência vem do modelo gratuito da Groq e não tem solução 100% garantida só via prompt.
- `rules-resolver.ts` resolve quais `RuleVersion`s se aplicam a uma análise (globais + com escopo por glob), e toda `Analysis` registra exatamente quais `RuleVersion`s estavam em vigor via `AnalysisRuleVersion` (mantendo o histórico de regras reproduzível mesmo depois que as regras mudam).
- `blocking.ts` implementa a regra de interatividade: um `Finding` com severidade `ALTA` e uma dúvida em aberto (`needsClarification`) define `isBlocking = true` e trava a análise até ser respondido (`clarification.service.ts`). Achados não bloqueantes não travam nada.
- Limites de segurança importantes de preservar ao mexer nesse módulo: limite de 50 mil caracteres no código enviado, rate limiting nos endpoints de IA (15 requisições / 15 min por usuário), timeout de 60s na chamada à LLM.

### Modelo de dados

Ver `apps/api/prisma/schema.prisma`. Relações principais: `Team` → `Project` → (`Rule` → `RuleVersion`, `Analysis` → `Finding` → `Clarification`, `ContextEntry`). `Finding.source` distingue `STATIC_ANALYSIS` de `AI`. IDOR é uma preocupação recorrente nesse schema (ex.: um `Finding` precisa pertencer à `Analysis` informada em requisições de clarify/dispute, e `ContextEntry.sourceFindingId` precisa pertencer ao mesmo projeto) — isso já foi corrigido antes e deve ser revisado novamente em qualquer novo endpoint que toque findings/analyses entre projetos.

### Frontend (`apps/web/src`)

Estrutura por feature em `src/features/{auth,projects,rules,editor,analysis}`, mais `src/components` e `src/lib/api-client` compartilhados. Estado de autenticação vive no `AuthContext`, que checa a sessão via `GET /auth/me` no boot (baseado em cookie, sem tokens em storage acessível por JS). Edição de código usa Monaco (`@monaco-editor/react`).

Linguagem visual: paleta inspirada na McLaren F1 — preto (`carbon`) como fundo do app inteiro, laranja "papaya" como cor de destaque/botões, cards brancos "flutuando" por cima. Sem iconografia/copy temática de corrida, só a paleta de cores. Componentes reutilizáveis: `Button` (formato pílula, baseado em variantes) e `Card` (polimórfico via prop `as` — cuidado ao combinar com `<li>`/`<details>` para não gerar HTML inválido).

Mais decisões de arquitetura e histórico de sessões: ver `NOTES.md`.
