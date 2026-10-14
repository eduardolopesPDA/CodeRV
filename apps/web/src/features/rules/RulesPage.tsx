import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookMarked,
  Clock,
  FileWarning,
  FolderTree,
  Pencil,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Surface } from "@/components/ui/Surface";
import { useToast } from "@/components/ui/Toast";
import { rulesApi } from "@/lib/api/rules";
import { getApiErrorMessage } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query/keys";
import { formatDateTime } from "@/lib/format";
import type { RuleInput, RuleListItem, RuleUpdateInput } from "@/lib/api/types";
import { useProject } from "@/features/projects/ProjectLayout";

export function RulesPage() {
  const { project } = useProject();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);

  const rulesQuery = useQuery({
    queryKey: queryKeys.rules(project.id),
    queryFn: ({ signal }) => rulesApi.list(project.id, signal),
  });

  const rules = rulesQuery.data ?? [];
  const selected =
    rules.find((rule) => rule.id === selectedId) ?? rules[0] ?? null;

  const versionsQuery = useQuery({
    queryKey: queryKeys.ruleVersions(selected?.id ?? "none"),
    queryFn: ({ signal }) => rulesApi.versions(selected!.id, signal),
    enabled: Boolean(selected),
  });

  const createMutation = useMutation({
    mutationFn: (input: RuleInput) => rulesApi.create(project.id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.rules(project.id),
      });
      setDialogMode(null);
      toast.success("Regra criada", "Ela já vale para as próximas análises.");
    },
    onError: (error) =>
      toast.error("Não foi possível criar a regra", getApiErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ ruleId, input }: { ruleId: string; input: RuleUpdateInput }) =>
      rulesApi.update(ruleId, input),
    onSuccess: async (version) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.rules(project.id),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.ruleVersions(version.ruleId),
        }),
      ]);
      setDialogMode(null);
      toast.success(
        `Versão ${version.version} salva`,
        "As análises anteriores mantêm a versão que usaram.",
      );
    },
    onError: (error) =>
      toast.error("Não foi possível salvar", getApiErrorMessage(error)),
  });

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">
              Regras do projeto
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-subtle">
              Fonte de verdade da IA. Regras com escopo só valem para os
              arquivos do glob.
            </p>
          </div>
          <Button size="sm" onClick={() => setDialogMode("create")}>
            <Plus className="h-3.5 w-3.5" />
            Nova
          </Button>
        </div>

        {rulesQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : rulesQuery.isError ? (
          <ErrorState
            message="Não consegui carregar as regras."
            onRetry={() => void rulesQuery.refetch()}
          />
        ) : rules.length === 0 ? (
          <EmptyState
            icon={<BookMarked className="h-5 w-5" />}
            title="Nenhuma regra ainda"
            description="Cadastre as convenções do time: nomes, estrutura de pastas, padrões de erro, o que nunca pode entrar em produção."
            action={
              <Button size="sm" onClick={() => setDialogMode("create")}>
                <Plus className="h-3.5 w-3.5" />
                Criar primeira regra
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2">
            {rules.map((rule) => (
              <li key={rule.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(rule.id)}
                  className={
                    "w-full rounded-card border p-4 text-left transition-colors " +
                    (selected?.id === rule.id
                      ? "border-papaya-500/40 bg-papaya-500/[0.06]"
                      : "border-line bg-surface hover:border-line-strong")
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="mono-chip">{rule.identifier}</span>
                    <span className="font-mono text-[11px] text-subtle">
                      v{rule.currentVersion?.version ?? "—"}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] font-semibold leading-snug text-ink">
                    {rule.currentVersion?.title ?? "Sem versão publicada"}
                  </p>
                  {rule.currentVersion?.scope ? (
                    <p className="mt-1 flex items-center gap-1 font-mono text-[11px] text-subtle">
                      <FolderTree className="h-3 w-3" />
                      {rule.currentVersion.scope}
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-subtle">Escopo global</p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="min-w-0">
        {!selected ? (
          <EmptyState
            icon={<BookMarked className="h-5 w-5" />}
            title="Selecione uma regra"
            description="Escolha uma regra à ver o conteúdo atual, o escopo e o histórico completo de versões."
          />
        ) : (
          <div className="space-y-4">
            <Surface className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mono-chip">{selected.identifier}</span>
                    <Badge tone="accent">v{selected.currentVersion?.version ?? "—"}</Badge>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-ink">
                    {selected.currentVersion?.title ?? "Sem versão"}
                  </h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDialogMode("edit")}
                  disabled={!selected.currentVersion}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
              </div>

              {selected.currentVersion ? (
                <div className="mt-4 space-y-4">
                  <p className="text-[13px] leading-relaxed text-muted whitespace-pre-wrap">
                    {selected.currentVersion.description}
                  </p>
                  <div className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-wide text-subtle">
                        Escopo
                      </p>
                      <p className="mt-1 font-mono text-xs text-ink">
                        {selected.currentVersion.scope ?? "global"}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-wide text-subtle">
                        Criada em
                      </p>
                      <p className="mt-1 text-xs text-ink">
                        {formatDateTime(selected.currentVersion.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-[13px] text-subtle">
                  Esta regra ainda não tem versão publicada.
                </p>
              )}
            </Surface>

            <Surface className="p-5">
              <h4 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                <Clock className="h-4 w-4 text-subtle" />
                Histórico de versões
              </h4>
              {versionsQuery.isLoading ? (
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : versionsQuery.isError ? (
                <ErrorState
                  message="Não consegui carregar o histórico."
                  onRetry={() => void versionsQuery.refetch()}
                  className="mt-4"
                />
              ) : (
                <ol className="mt-4 space-y-3 border-l border-line pl-4">
                  {[...(versionsQuery.data ?? [])]
                    .reverse()
                    .map((version) => (
                      <li key={version.id} className="relative">
                        <span
                          className={
                            "absolute -left-[21px] top-1.5 h-2 w-2 rounded-full " +
                            (version === (versionsQuery.data ?? [])[
                              (versionsQuery.data ?? []).length - 1
                            ]
                              ? "bg-papaya-500"
                              : "bg-line-strong")
                          }
                          aria-hidden
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-papaya-400">
                            v{version.version}
                          </span>
                          <span className="text-[13px] font-medium text-ink">
                            {version.title}
                          </span>
                          <span className="text-[11px] text-subtle">
                            {formatDateTime(version.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted">
                          {version.description}
                        </p>
                      </li>
                    ))}
                </ol>
              )}
            </Surface>
          </div>
        )}
      </div>

      <RuleDialog
        mode={dialogMode}
        rule={dialogMode === "edit" ? selected : null}
        nextVersion={(selected?.currentVersion?.version ?? 0) + 1}
        onClose={() => setDialogMode(null)}
        onCreate={(input) => createMutation.mutate(input)}
        onUpdate={(input) =>
          selected && updateMutation.mutate({ ruleId: selected.id, input })
        }
        creating={createMutation.isPending}
        updating={updateMutation.isPending}
      />
    </div>
  );
}

function RuleDialog({
  mode,
  rule,
  nextVersion,
  onClose,
  onCreate,
  onUpdate,
  creating,
  updating,
}: {
  mode: "create" | "edit" | null;
  rule: RuleListItem | null;
  nextVersion: number;
  onClose: () => void;
  onCreate: (input: RuleInput) => void;
  onUpdate: (input: RuleUpdateInput) => void;
  creating: boolean;
  updating: boolean;
}) {
  const [identifier, setIdentifier] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && rule?.currentVersion) {
      setIdentifier(rule.identifier);
      setTitle(rule.currentVersion.title);
      setDescription(rule.currentVersion.description);
      setScope(rule.currentVersion.scope ?? "");
      setErrors({});
    } else if (mode === "create") {
      setIdentifier("");
      setTitle("");
      setDescription("");
      setScope("");
      setErrors({});
    }
  }, [mode, rule]);

  const isEdit = mode === "edit";

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    if (!title.trim() || !description.trim() || (!isEdit && !identifier.trim())) {
      setErrors({
        title: !title.trim() ? "Informe o título." : "",
        description: !description.trim() ? "Descreva a regra." : "",
        identifier:
          !isEdit && !identifier.trim() ? "Informe o identificador." : "",
      });
      return;
    }
    if (isEdit) {
      onUpdate({
        title: title.trim(),
        description: description.trim(),
        ...(scope.trim() ? { scope: scope.trim() } : {}),
      });
    } else {
      onCreate({
        identifier: identifier.trim(),
        title: title.trim(),
        description: description.trim(),
        ...(scope.trim() ? { scope: scope.trim() } : {}),
      });
    }
  }

  return (
    <Dialog
      open={mode !== null}
      onClose={onClose}
      size="lg"
      title={isEdit ? "Editar regra" : "Nova regra"}
      description={
        isEdit
          ? `Editar não sobrescreve: cada salvamento publica a versão ${nextVersion} e preserva as anteriores.`
          : "A regra passa a orientar a IA em todas as próximas análises deste projeto."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEdit ? (
          <Field
            label="Identificador"
            hint="Um código curto e estável, ex.: RN-001 ou CONV-PASTAS."
            error={errors.identifier || null}
            required
          >
            {({ id }) => (
              <Input
                id={id}
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="RN-001"
                className="font-mono text-xs"
              />
            )}
          </Field>
        ) : (
          <p className="mono-chip">{rule?.identifier}</p>
        )}

        <Field label="Título" error={errors.title || null} required>
          {({ id }) => (
            <Input
              id={id}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Nomes de variáveis em snake_case no Python"
            />
          )}
        </Field>

        <Field
          label="Descrição"
          hint="Escreva como uma instrução para quem lê o código — a IA compara o trecho com este texto."
          error={errors.description || null}
          required
        >
          {({ id }) => (
            <Textarea
              id={id}
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Todas as variáveis e funções em Python devem usar snake_case..."
            />
          )}
        </Field>

        <Field
          label="Escopo (glob)"
          hint="Opcional. Deixe vazio para valer em todo o projeto."
        >
          {({ id }) => (
            <Input
              id={id}
              value={scope}
              onChange={(event) => setScope(event.target.value)}
              placeholder="src/payments/**"
              className="font-mono text-xs"
            />
          )}
        </Field>

        {isEdit ? (
          <p className="flex items-start gap-2 rounded-field border border-sev-media-line bg-sev-media-soft px-3 py-2.5 text-[12px] leading-relaxed text-sev-media">
            <FileWarning className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Análises antigas continuam amarradas às versões que usaram — nada do
            histórico é reescrito.
          </p>
        ) : null}

        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button variant="ghost" onClick={onClose} disabled={creating || updating}>
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={creating || updating}
          >
            {isEdit ? `Publicar v${nextVersion}` : "Criar regra"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
