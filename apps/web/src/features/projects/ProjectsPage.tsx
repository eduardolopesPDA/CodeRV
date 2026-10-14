import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Badge } from "@/components/ui/Badge";
import { Surface } from "@/components/ui/Surface";
import { Skeleton } from "@/components/ui/Spinner";
import { PageHeader } from "@/components/layout/PageHeader";
import { projectsApi } from "@/lib/api/projects";
import { teamsApi } from "@/lib/api/teams";
import { queryKeys } from "@/lib/query/keys";
import { firstName, formatRelative, greeting } from "@/lib/format";
import { languageLabel } from "@/lib/labels";
import { useAuth } from "@/features/auth/AuthContext";
import type { Project, ProjectInput } from "@/lib/api/types";
import { getApiErrorMessage, getFieldError } from "@/lib/api/errors";
import { useToast } from "@/components/ui/Toast";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

export function ProjectsPage() {
  const { user } = useAuth();
  useDocumentTitle("Projetos");
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const projectsQuery = useQuery({
    queryKey: queryKeys.projects,
    queryFn: ({ signal }) => projectsApi.list(signal),
  });
  const teamsQuery = useQuery({
    queryKey: queryKeys.teams,
    queryFn: ({ signal }) => teamsApi.list(signal),
  });

  const teamNames = useMemo(() => {
    const map = new Map<string, string>();
    (teamsQuery.data ?? []).forEach((team) => map.set(team.id, team.name));
    return map;
  }, [teamsQuery.data]);

  const filtered = useMemo(() => {
    const list = projectsQuery.data ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (project) =>
        project.name.toLowerCase().includes(term) ||
        project.description?.toLowerCase().includes(term) ||
        project.technologies.some((tech) => tech.toLowerCase().includes(term)),
    );
  }, [projectsQuery.data, search]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`${greeting()}, ${user ? firstName(user.name) : ""}`}
        title="Seus projetos"
        description="Cada projeto carrega o próprio contexto, as regras versionadas e o histórico de revisões."
        actions={
          <Button size="lg" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo projeto
          </Button>
        }
      />

      {(projectsQuery.data ?? []).length > 0 ? (
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, descrição ou tecnologia"
            aria-label="Buscar projetos"
            className="pl-9"
          />
        </div>
      ) : null}

      {projectsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-44" />
          ))}
        </div>
      ) : projectsQuery.isError ? (
        <ErrorState
          message="Não consegui carregar seus projetos."
          onRetry={() => void projectsQuery.refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-5 w-5" />}
          title={
            (projectsQuery.data ?? []).length === 0
              ? "Nenhum projeto ainda"
              : "Nada encontrado"
          }
          description={
            (projectsQuery.data ?? []).length === 0
              ? "Crie um projeto, descreva como ele é construído e cadastre as regras que a IA deve respeitar."
              : "Tente outro termo de busca."
          }
          action={
            (projectsQuery.data ?? []).length === 0 ? (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Criar primeiro projeto
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              teamName={teamNames.get(project.teamId)}
            />
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        teams={teamsQuery.data ?? []}
        onCreated={() => {
          setCreateOpen(false);
          toast.success("Projeto criado", "Agora descreva o contexto dele.");
        }}
      />
    </div>
  );
}

function ProjectCard({
  project,
  teamName,
}: {
  project: Project;
  teamName?: string;
}) {
  return (
    <Link to={`/projects/${project.id}`} className="group block">
      <Surface hover className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-papaya-300">
            {project.name}
          </h2>
          {teamName ? (
            <Badge size="sm">{teamName}</Badge>
          ) : null}
        </div>

        <p className="mt-2 line-clamp-2 flex-1 text-[13px] leading-relaxed text-muted">
          {project.description ?? "Sem descrição ainda."}
        </p>

        {project.technologies.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 4).map((tech) => (
              <span key={tech} className="mono-chip">
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 ? (
              <span className="mono-chip">
                +{project.technologies.length - 4}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[11px] text-subtle">
          <span className="flex flex-wrap gap-1">
            {project.supportedLanguages.slice(0, 3).map((lang) => (
              <span key={lang} className="font-mono">
                {languageLabel(lang)}
              </span>
            ))}
            {project.supportedLanguages.length === 0 ? (
              <span>sem linguagens</span>
            ) : null}
          </span>
          <span className="shrink-0">{formatRelative(project.createdAt)}</span>
        </div>
      </Surface>
    </Link>
  );
}

function CreateProjectDialog({
  open,
  onClose,
  teams,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  teams: { id: string; name: string }[];
  onCreated: (project: Project) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [description, setDescription] = useState("");
  const [languages, setLanguages] = useState<string[]>(["javascript"]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const effectiveTeamId = teamId || teams[0]?.id || "";

  function toggleLanguage(value: string) {
    setLanguages((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  }

  async function handleSubmit() {
    setError(null);
    setFieldErrors({});
    if (!name.trim() || !effectiveTeamId || languages.length === 0) {
      setError("Preencha o nome, escolha um time e ao menos uma linguagem.");
      return;
    }
    setSaving(true);
    try {
      const input: ProjectInput = {
        teamId: effectiveTeamId,
        name: name.trim(),
        supportedLanguages: languages,
        ...(description.trim() ? { description: description.trim() } : {}),
      };
      const project = await projectsApi.create(input);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
        queryClient.invalidateQueries({ queryKey: queryKeys.teams }),
      ]);
      setName("");
      setDescription("");
      onCreated(project);
    } catch (err) {
      setError(getApiErrorMessage(err, "Não foi possível criar o projeto."));
      setFieldErrors({
        name: getFieldError(err, "name") ?? "",
        teamId: getFieldError(err, "teamId") ?? "",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Novo projeto"
      description="O contexto que você preencher depois alimenta diretamente a análise da IA."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={() => void handleSubmit()} loading={saving}>
            Criar projeto
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error ? (
          <p className="rounded-field border border-sev-alta-line bg-sev-alta-soft px-3 py-2 text-[13px] text-sev-alta">
            {error}
          </p>
        ) : null}

        <Field
          label="Nome do projeto"
          error={fieldErrors.name || null}
          required
        >
          {({ id }) => (
            <Input
              id={id}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: API de pagamentos"
              autoFocus
            />
          )}
        </Field>

        <Field label="Time" error={fieldErrors.teamId || null} required>
          {({ id }) => (
            <Select
              id={id}
              value={effectiveTeamId}
              onChange={(e) => setTeamId(e.target.value)}
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Descrição" hint="Opcional — o que este projeto faz.">
          {({ id }) => (
            <Textarea
              id={id}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uma API que processa cobranças recorrentes."
            />
          )}
        </Field>

        <div className="space-y-2">
          <p className="text-[13px] font-medium text-muted">
            Linguagens suportadas <span className="text-papaya-400">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "javascript",
              "typescript",
              "python",
              "java",
              "go",
              "php",
              "csharp",
            ].map((lang) => {
              const active = languages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  aria-pressed={active}
                  className={
                    "rounded-full border px-3 py-1.5 font-mono text-[11px] font-medium transition-colors " +
                    (active
                      ? "border-papaya-500/40 bg-papaya-500/15 text-papaya-300"
                      : "border-line-strong bg-raised text-muted hover:text-ink")
                  }
                >
                  {languageLabel(lang)}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-subtle">
            A análise só aceita linguagens listadas aqui. JavaScript e Python
            também passam por linter.
          </p>
        </div>
      </div>
    </Dialog>
  );
}
