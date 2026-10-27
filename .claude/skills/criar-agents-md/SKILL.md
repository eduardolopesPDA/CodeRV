---
name: criar-agents-md
description: Cria ou atualiza o AGENTS.md de um repositório — o arquivo de instruções que agentes de código (Codex, Cursor, Copilot, Gemini CLI, Claude Code etc.) leem antes de mexer no projeto — a partir do que o repo realmente tem: stack, comandos de build/teste/lint, estrutura de pastas e convenções. Use sempre que o usuário pedir para criar, gerar, escrever, revisar ou atualizar um AGENTS.md, "preparar o repo para agentes de IA", documentar o projeto para agentes de código, migrar um CLAUDE.md/.cursorrules/copilot-instructions para AGENTS.md, ou digitar /criar-agents-md. Não serve para criar subagentes (.claude/agents/) nem skills.
allowed-tools: Read, Glob, Grep, Write, Edit, Bash(git log *)
---

# Criar AGENTS.md

O AGENTS.md é o "README para agentes": tudo o que um agente de código precisa saber
para trabalhar no repo sem adivinhar. Ele é carregado em **toda** sessão, então cada
linha custa contexto o tempo todo. O objetivo é um arquivo curto, verificável e
específico deste projeto — não um tutorial genérico de boas práticas.

## Regras que não se negociam

1. **Nada inventado.** Todo comando, caminho e versão citado tem que existir no repo.
   Se você não achou a fonte (script, Makefile, CI), não escreva — pergunte.
2. **Nada de TODO, placeholder ou `<preencher>`.** Se falta informação, pergunte
   antes de escrever; se o usuário não souber, omita a seção.
3. **Só o que o agente não descobriria sozinho em 10 segundos.** "Use nomes
   descritivos" não entra; "testes de integração precisam do `docker compose up db`
   antes" entra.
4. **Curto.** Mire em 60–150 linhas na raiz. Detalhe longo vira link para `docs/`.

## Fluxo

1. **Ver o que já existe.** Procure `AGENTS.md`, `CLAUDE.md`, `.cursorrules`,
   `.cursor/rules/`, `.github/copilot-instructions.md`, `GEMINI.md` e o `README.md`.
   Se já houver AGENTS.md, o trabalho é **atualizar**: preserve o que está certo,
   corrija o que ficou desatualizado e mostre o diff proposto antes de gravar.
2. **Descobrir o projeto** lendo os arquivos-fonte de verdade (manifests, scripts,
   CI, configs de lint/format, estrutura de pastas, `git log` para o padrão de
   commits). O checklist por ecossistema está em [reference.md](reference.md#descoberta).
3. **Perguntar só o que o código não responde** — no máximo 3–4 perguntas, de uma
   vez. Ex.: regras de negócio sensíveis, áreas que o agente não deve tocar, fluxo de
   PR/deploy, idioma do código e dos commits.
4. **Escrever** seguindo o modelo de seções em
   [reference.md](reference.md#modelo-de-seções). Comandos em blocos de código,
   prontos para copiar.
5. **Monorepo?** Raiz com o geral + um AGENTS.md curto por pacote que tenha
   comandos ou regras próprias. Ver [reference.md](reference.md#monorepos).
6. **Integração com Claude Code.** O Claude Code lê `CLAUDE.md`, não `AGENTS.md`.
   Se o usuário usa Claude Code, ofereça o `CLAUDE.md` que importa o AGENTS.md
   (detalhes em [reference.md](reference.md#claude-code-e-outras-ferramentas)).
7. **Revisar antes de entregar** com o checklist final do reference.md e resumir ao
   usuário: o que entrou, o que ficou de fora e por quê, e quais perguntas ficaram
   sem resposta.
