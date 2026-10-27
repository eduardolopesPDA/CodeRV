# Referência — criar-agents-md

Material de apoio do [SKILL.md](SKILL.md). Leia a seção que o passo atual pedir.

## Descoberta

Leia a fonte; não deduza pelo nome da pasta.

| Ecossistema | Onde estão stack e comandos |
|---|---|
| JS/TS | `package.json` (`scripts`, `engines`, `packageManager`), lockfile (`package-lock.json` → npm, `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `bun.lockb` → bun), `tsconfig.json`, `vite.config.*`, `next.config.*` |
| Python | `pyproject.toml` (`[project]`, `[tool.*]`, `[tool.poetry.scripts]`), `requirements*.txt`, `uv.lock`/`poetry.lock`, `tox.ini`, `noxfile.py`, `pytest.ini` |
| Rust | `Cargo.toml` (workspace, features), `rust-toolchain.toml`, `clippy.toml` |
| Go | `go.mod` (versão), `Makefile`, `.golangci.yml` |
| Java/Kotlin | `pom.xml`, `build.gradle(.kts)`, `gradlew` |
| .NET | `*.sln`, `*.csproj`, `global.json` |
| Qualquer um | `Makefile`, `justfile`, `Taskfile.yml`, `docker-compose.yml`, `Dockerfile`, `.env.example`, `.github/workflows/*.yml`, `.gitlab-ci.yml` |

Além dos comandos, colete:

- **CI** — o que roda no PR é o que o agente precisa rodar antes de dizer "pronto".
  Os passos do workflow são a fonte mais confiável de comandos reais.
- **Lint/format** — `.eslintrc*`, `eslint.config.*`, `.prettierrc*`, `biome.json`,
  `ruff.toml`/`[tool.ruff]`, `.editorconfig`. Cite a ferramenta e o comando, não as regras.
- **Estrutura** — liste as pastas de primeiro e segundo nível que importam e diga o
  papel de cada uma. Ignore `node_modules`, `dist`, `build`, `.venv`, `target`.
- **Commits** — `git log --oneline -20` mostra se o repo usa Conventional Commits,
  idioma das mensagens, prefixos de ticket.
- **Variáveis de ambiente** — só os nomes, de `.env.example`. Nunca copie valores de
  `.env` real nem de qualquer segredo.
- **Pegadinhas** — migrations, código gerado (não editar à mão), arquivos grandes,
  serviços que precisam estar de pé para os testes.

## Modelo de seções

Use as seções que fizerem sentido, nesta ordem. Seção sem conteúdo real é removida,
não deixada vazia.

~~~~markdown
# AGENTS.md

<Uma ou duas frases: o que é o projeto e para quem.>

## Stack
- <linguagem + versão>, <framework principal>, <banco>, <gerenciador de pacotes>

## Comandos
```bash
<instalar dependências>
<rodar em dev>
<rodar todos os testes>
<rodar um teste só>        # o agente usa muito mais que o anterior
<lint>  /  <format>
<build>
```

## Estrutura
- `src/api/` — rotas HTTP; não colocar regra de negócio aqui
- `src/domain/` — regras de negócio, sem dependência de framework

## Convenções
- <só o que diverge do padrão da linguagem ou não está no linter>

## Testes
- <onde ficam, como nomear, o que precisa estar de pé antes>

## Git e PR
- <formato de commit, branch, o que precisa passar antes de abrir PR>

## Não faça
- <áreas proibidas, arquivos gerados, comandos destrutivos, segredos>
~~~~

### Exemplos de linha boa e ruim

| Ruim (genérico ou inverificável) | Bom (específico e checável) |
|---|---|
| Escreva código limpo e testado. | Todo endpoint novo ganha teste em `tests/api/` usando o fixture `client`. |
| Use as boas práticas de React. | Componentes ficam em `src/components/<Nome>/index.tsx`; estado global só via Zustand (`src/store/`). |
| Rode os testes. | `pnpm test -- path/do/arquivo.test.ts` para um arquivo; `pnpm test` antes de commitar. |
| Cuidado com o banco. | Nunca edite `prisma/migrations/` à mão; gere com `pnpm prisma migrate dev --name <nome>`. |

## Monorepos

- Ferramentas compatíveis leem o AGENTS.md **mais próximo** do arquivo sendo editado;
  o da raiz vale para o que não for sobrescrito.
- Raiz: visão geral, comandos de workspace (`pnpm -r`, `turbo run`, `nx`,
  `cargo test --workspace`), convenções comuns.
- Por pacote: só o que muda — comandos específicos, stack diferente, regras locais.
  Não repita o conteúdo da raiz.

## Claude Code e outras ferramentas

AGENTS.md é um padrão aberto (agents.md) lido por Codex, Cursor, GitHub Copilot,
Gemini CLI, Aider, Zed e outros. O Claude Code lê `CLAUDE.md`. Para não manter dois
arquivos, ofereça um destes caminhos:

1. **`CLAUDE.md` que importa o AGENTS.md** (recomendado, funciona em Windows):
   ```markdown
   @AGENTS.md

   ## Específico do Claude Code
   - <só o que não se aplica a outras ferramentas, se houver>
   ```
2. **Symlink** `CLAUDE.md -> AGENTS.md` — só em macOS/Linux ou com Git configurado
   para symlinks no Windows.

Ao migrar de `.cursorrules`, `.cursor/rules/*.mdc`, `.github/copilot-instructions.md`
ou um CLAUDE.md existente: traga o conteúdo que ainda é verdade, descarte o resto, e
pergunte se o usuário quer apagar o arquivo antigo ou deixá-lo apontando para o AGENTS.md.
Não apague nada sem confirmação.

## Checklist final

Antes de gravar, confirme:

- [ ] Cada comando citado existe (script, target do Makefile, passo de CI).
- [ ] Cada caminho citado existe no repo.
- [ ] Nenhum TODO, placeholder, `<...>` ou seção vazia.
- [ ] Nenhum segredo, token, URL interna ou valor de `.env`.
- [ ] Nada que o linter/formatter já garante.
- [ ] Nada que repete o README palavra por palavra — linke em vez de copiar.
- [ ] Tamanho razoável (raiz ≲ 150 linhas).
- [ ] Se já existia AGENTS.md, o diff foi mostrado e aprovado.
