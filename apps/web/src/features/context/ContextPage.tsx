import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Surface } from "@/components/ui/Surface";
import { useToast } from "@/components/ui/Toast";
import { contextApi } from "@/lib/api/context";
import { projectsApi } from "@/lib/api/projects";
import { getApiErrorMessage } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query/keys";
import { formatRelative } from "@/lib/format";
import { LANGUAGES } from "@/lib/labels";
import type { Project, ProjectPatch } from "@/lib/api/types";
import { useProject } from "@/features/projects/ProjectLayout";

export function ContextPage() {
  const { project } = useProject();

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <ProjectDetailsForm project={project} />
      <ContextEntriesPanel projectId={project.id} />
    </div>
  );
}

interface FormState {
  description: string;
  objective: string;
  technologies: string;
  supportedLanguages: string[];
  architecture: string;
  conventions: string;
  additionalInfo: string;
}

function toForm(project: Project): FormState {
  return {
    description: project.description ?? "",
    objective: project.objective ?? "",
    technologies: project.technologies.join(", "),
    supportedLanguages: project.supportedLanguages,
    architecture: project.architecture ?? "",
    conventions: project.conventions ?? "",
    additionalInfo: project.additionalInfo ?? "",
  };
}

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function ProjectDetailsForm({ project }: { project: Project }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState<FormState>(() => toForm(project));

  useEffect(() => {
    setForm(toForm(project));
  }, [project]);

  const dirty = JSON.stringify(form) !== JSON.stringify(toForm(project));

  const updateMutation = useMutation({
    mutationFn: (input: ProjectPatch) => projectsApi.update(project.id, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.project(project.id), updated);
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      toast.success("Contexto salvo", "A próxima análise já usa estas definições.");
    },
    onError: (error) =>
      toast.error("Não foi possível salvar", getApiErrorMessage(error)),
  });

  function handleSubmit() {
    updateMutation.mutate({
      description: form.description.trim() || null,
      objective: form.objective.trim() || null,
      architecture: form.architecture.trim() || null,
      conventions: form.conventions.trim() || null,
      additionalInfo: form.additionalInfo.trim() || null,
      technologies: splitCsv(form.technologies),
      supportedLanguages: form.supportedLanguages,
    });
  }

  function toggleLanguage(value: string) {
    setForm((previous) => ({
      ...previous,
      supportedLanguages: previous.supportedLanguages.includes(value)
        ? previous.supportedLanguages.filter((item) => item !== value)
        : [...previous.supportedLanguages, value],
    }));
  }

  return (
    <Surface className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">
            Contexto do projeto
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-subtle">
            É este material que a IA lê antes de julgar o seu código. Campos
            vazios ficam sem valor.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {dirty ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setForm(toForm(project))}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Descartar
            </Button>
          ) : null}
          <Button
            size="sm"
            loading={updateMutation.isPending}
            disabled={!dirty}
            onClick={handleSubmit}
          >
            <Check className="h-3.5 w-3.5" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <SectionTitle>Sobre</SectionTitle>
        <Field label="Descrição">
          {({ id }) => (
            <Textarea
              id={id}
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  description: event.target.value,
                }))
              }
              placeholder="O que este sistema faz e para quem."
            />
          )}
        </Field>
        <Field label="Objetivo">
          {({ id }) => (
            <Textarea
              id={id}
              rows={2}
              value={form.objective}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  objective: event.target.value,
                }))
              }
              placeholder="Qual problema ele resolve."
            />
          )}
        </Field>

        <SectionTitle>Stack</SectionTitle>
        <Field
          label="Tecnologias"
          hint="Separadas por vírgula. Ex.: Node.js, PostgreSQL, Redis"
        >
          {({ id }) => (
            <Input
              id={id}
              value={form.technologies}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  technologies: event.target.value,
                }))
              }
              placeholder="Node.js, PostgreSQL"
            />
          )}
        </Field>

        <div className="space-y-2">
          <p className="text-[13px] font-medium text-muted">
            Linguagens suportadas
          </p>
          <p className="text-[11px] text-subtle">
            A análise só aceita código numa destas linguagens.
          </p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => {
              const active = form.supportedLanguages.includes(lang.value);
              return (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => toggleLanguage(lang.value)}
                  aria-pressed={active}
                  className={
                    "rounded-full border px-3 py-1.5 font-mono text-[11px] font-medium transition-colors " +
                    (active
                      ? "border-papaya-500/40 bg-papaya-500/15 text-papaya-300"
                      : "border-line-strong bg-raised text-muted hover:text-ink")
                  }
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>

        <SectionTitle>Arquitetura e convenções</SectionTitle>
        <Field label="Arquitetura">
          {({ id }) => (
            <Textarea
              id={id}
              rows={3}
              value={form.architecture}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  architecture: event.target.value,
                }))
              }
              placeholder="Monorepo com apps/api e apps/web; camadas services → repositories."
            />
          )}
        </Field>
        <Field label="Convenções">
          {({ id }) => (
            <Textarea
              id={id}
              rows={3}
              value={form.conventions}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  conventions: event.target.value,
                }))
              }
              placeholder="Tratamento de erro sempre via error-handler; nenhum console.log em produção."
            />
          )}
        </Field>
        <Field label="Informações adicionais">
          {({ id }) => (
            <Textarea
              id={id}
              rows={2}
              value={form.additionalInfo}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  additionalInfo: event.target.value,
                }))
              }
              placeholder="Restrições de compliance, dívidas conhecidas, etc."
            />
          )}
        </Field>
      </div>
    </Surface>
  );
}

function ContextEntriesPanel({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [content, setContent] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const entriesQuery = useQuery({
    queryKey: queryKeys.context(projectId),
    queryFn: ({ signal }) => contextApi.list(projectId, signal),
  });

  const createMutation = useMutation({
    mutationFn: () => contextApi.create(projectId, content.trim()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.context(projectId),
      });
      setContent("");
      toast.success("Contexto adicionado", "Vale para as próximas análises.");
    },
    onError: (error) =>
      toast.error("Não foi possível adicionar", getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contextApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.context(projectId),
      });
      setConfirmingId(null);
      toast.success("Item removido");
    },
    onError: (error) =>
      toast.error("Não foi possível remover", getApiErrorMessage(error)),
  });

  const entries = entriesQuery.data ?? [];

  return (
    <Surface className="p-5">
      <div>
        <h2 className="text-[15px] font-semibold text-ink">
          Contexto permanente
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-subtle">
          Decisões e definições que nasceram de um esclarecimento — rastreáveis
          até o achado que as originou.
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <Textarea
          rows={2}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Ex.: Em pagamentos, sempre validar idempotência antes de lançar."
          aria-label="Nova entrada de contexto"
        />
      </div>
      <div className="mt-2 flex justify-end">
        <Button
          size="sm"
          loading={createMutation.isPending}
          disabled={content.trim().length === 0}
          onClick={() => createMutation.mutate()}
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </Button>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        {entriesQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : entriesQuery.isError ? (
          <ErrorState
            message="Não consegui carregar o contexto permanente."
            onRetry={() => void entriesQuery.refetch()}
          />
        ) : entries.length === 0 ? (
          <EmptyState
            className="py-8"
            title="Nada confirmado ainda"
            description="Responda a dúvida de um achado marcando a opção de salvar como contexto — ou adicione uma entrada manualmente acima."
          />
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="group rounded-field border border-line bg-raised/40 px-3 py-2.5"
              >
                <p className="text-[13px] leading-relaxed text-ink">
                  {entry.content}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-subtle">
                    {formatRelative(entry.createdAt)}
                    {entry.sourceFindingId
                      ? " · originada em um achado"
                      : ""}
                  </span>
                  {confirmingId === entry.id ? (
                    <span className="flex items-center gap-1.5">
                      <span className="text-[11px] text-sev-alta">
                        Remover?
                      </span>
                      <Button
                        size="sm"
                        variant="danger"
                        loading={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(entry.id)}
                      >
                        Sim
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmingId(null)}
                      >
                        Não
                      </Button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingId(entry.id)}
                      aria-label="Remover entrada de contexto"
                      className="rounded-full p-1.5 text-subtle opacity-0 transition-opacity hover:bg-sev-alta-soft hover:text-sev-alta focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Surface>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="border-b border-line pb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-papaya-400">
      {children}
    </h3>
  );
}
