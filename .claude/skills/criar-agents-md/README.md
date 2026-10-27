# criar-agents-md

Skill do Claude Code que cria ou atualiza o `AGENTS.md` de um repositório, o arquivo
que agentes de código (Codex, Cursor, Copilot, Gemini CLI, Claude Code) leem antes de
mexer no projeto. Ela lê o repo de verdade (manifests, scripts, CI, configs de lint,
`git log`) e só escreve comandos e caminhos que existem, sem TODO nem texto genérico.

## Como usar

- **Global (todos os projetos):** copie esta pasta para `~/.claude/skills/criar-agents-md/`.
- **Num projeto só (compartilhada via git):** copie para `.claude/skills/criar-agents-md/`
  dentro do repo e faça commit.

Reinicie o Claude Code e peça "cria um AGENTS.md pra esse repo" ou digite `/criar-agents-md`.

## Arquivos

- `SKILL.md` — quando disparar e o fluxo essencial.
- `reference.md` — checklist de descoberta por ecossistema, modelo de seções,
  monorepos, integração com CLAUDE.md e checklist final.
