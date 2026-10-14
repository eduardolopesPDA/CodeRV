import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Crown, Mail, Plus, UserPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Surface } from "@/components/ui/Surface";
import { useToast } from "@/components/ui/Toast";
import { teamsApi } from "@/lib/api/teams";
import { getApiErrorMessage } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query/keys";
import { formatDate } from "@/lib/format";
import type { Role, Team } from "@/lib/api/types";
import { useAuth } from "@/features/auth/AuthContext";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

export function TeamsPage() {
  const { user } = useAuth();
  useDocumentTitle("Times");
  const toast = useToast();
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [membersTeamId, setMembersTeamId] = useState<string | null>(null);

  const teamsQuery = useQuery({
    queryKey: queryKeys.teams,
    queryFn: ({ signal }) => teamsApi.list(signal),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => teamsApi.create(name),
    onSuccess: async (team) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.teams });
      setCreateOpen(false);
      setMembersTeamId(team.id);
      toast.success("Time criado", "Convide pessoas pelo e-mail.");
    },
    onError: (error) =>
      toast.error("Não foi possível criar o time", getApiErrorMessage(error)),
  });

  const teams = teamsQuery.data ?? [];
  const selectedTeam = teams.find((team) => team.id === membersTeamId) ?? null;
  const myRole = (team: Team): Role | undefined =>
    team.members?.find((member) => member.userId === user?.id)?.role;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-papaya-400">
            Organização
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Times</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">
            Todo projeto pertence a um time. Só quem é membro enxerga o
            projeto — e só <strong>OWNER</strong> convida gente nova.
          </p>
        </div>
        <Button size="lg" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo time
        </Button>
      </div>

      {teamsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : teamsQuery.isError ? (
        <ErrorState
          message="Não consegui carregar seus times."
          onRetry={() => void teamsQuery.refetch()}
        />
      ) : teams.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="Nenhum time"
          description="Crie um time para agrupar projetos e pessoas."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Criar time
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {teams.map((team) => {
            const role = myRole(team);
            const memberCount = team.members?.length ?? 0;
            return (
              <Surface key={team.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-semibold text-ink">
                      {team.name}
                    </h2>
                    <p className="mt-1 text-[11px] text-subtle">
                      criado em {formatDate(team.createdAt)}
                    </p>
                  </div>
                  {role === "OWNER" ? (
                    <Badge tone="accent">
                      <Crown className="h-3 w-3" />
                      Owner
                    </Badge>
                  ) : (
                    <Badge>Membro</Badge>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
                  <Users className="h-4 w-4 text-subtle" />
                  <span className="text-[13px] text-muted">
                    {memberCount === 0
                      ? "sem membros"
                      : `${memberCount} ${memberCount === 1 ? "membro" : "membros"}`}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto"
                    onClick={() => setMembersTeamId(team.id)}
                  >
                    Gerenciar
                  </Button>
                </div>
              </Surface>
            );
          })}
        </div>
      )}

      <CreateTeamDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(name) => createMutation.mutate(name)}
        loading={createMutation.isPending}
      />

      <MembersDialog
        team={selectedTeam}
        canInvite={selectedTeam ? myRole(selectedTeam) === "OWNER" : false}
        onClose={() => setMembersTeamId(null)}
      />
    </div>
  );
}

function CreateTeamDialog({
  open,
  onClose,
  onCreate,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  loading: boolean;
}) {
  const [name, setName] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
    setName("");
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Novo time"
      description="O time que você criar começa com você como OWNER."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => name.trim() && onCreate(name.trim())}
            loading={loading}
          >
            Criar time
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Field label="Nome do time" required>
          {({ id }) => (
            <Input
              id={id}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Plataforma"
              autoFocus
            />
          )}
        </Field>
      </form>
    </Dialog>
  );
}

function MembersDialog({
  team,
  canInvite,
  onClose,
}: {
  team: Team | null;
  canInvite: boolean;
  onClose: () => void;
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");

  const teamId = team?.id ?? "";

  const membersQuery = useQuery({
    queryKey: queryKeys.teamMembers(teamId),
    queryFn: ({ signal }) => teamsApi.listMembers(teamId, signal),
    enabled: Boolean(teamId),
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      teamsApi.addMember(teamId, { email: email.trim(), role }),
    onSuccess: async (member) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.teamMembers(teamId),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.teams });
      setEmail("");
      toast.success(
        "Membro adicionado",
        `${member.user?.name ?? member.user?.email ?? "Pessoa"} agora faz parte do time.`,
      );
    },
    onError: (error) =>
      toast.error("Não foi possível adicionar", getApiErrorMessage(error)),
  });

  return (
    <Dialog
      open={Boolean(team)}
      onClose={() => {
        setEmail("");
        onClose();
      }}
      title={team?.name ?? ""}
      description="Membros do time — quem é OWNER pode convidar novas pessoas."
      footer={
        <Button variant="ghost" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      <div className="space-y-5">
        {membersQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : membersQuery.isError ? (
          <ErrorState
            message="Não consegui carregar os membros."
            onRetry={() => void membersQuery.refetch()}
          />
        ) : (
          <ul className="space-y-2">
            {(membersQuery.data ?? []).map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-3 rounded-field border border-line bg-raised/40 px-3 py-2.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-raised text-muted">
                  <Users className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ink">
                    {member.user?.name ?? "Usuário"}
                  </span>
                  <span className="block truncate text-[11px] text-subtle">
                    {member.user?.email}
                  </span>
                </span>
                {member.role === "OWNER" ? (
                  <Badge tone="accent">
                    <Crown className="h-3 w-3" />
                    Owner
                  </Badge>
                ) : (
                  <Badge>Membro</Badge>
                )}
              </li>
            ))}
          </ul>
        )}

        {canInvite ? (
          <form
            className="space-y-3 border-t border-line pt-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (email.trim()) inviteMutation.mutate();
            }}
          >
            <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
              <UserPlus className="h-4 w-4 text-papaya-400" />
              Convidar pessoa
            </p>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
              <Field label="E-mail" required>
                {({ id }) => (
                  <Input
                    id={id}
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="pessoa@empresa.com"
                  />
                )}
              </Field>
              <Field label="Papel">
                {({ id }) => (
                  <Select
                    id={id}
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value as Role)
                    }
                  >
                    <option value="MEMBER">Membro</option>
                    <option value="OWNER">Owner</option>
                  </Select>
                )}
              </Field>
            </div>
            <Button
              type="submit"
              size="sm"
              loading={inviteMutation.isPending}
              disabled={email.trim().length === 0}
            >
              <Mail className="h-3.5 w-3.5" />
              Adicionar ao time
            </Button>
          </form>
        ) : (
          <p className="border-t border-line pt-4 text-[12px] leading-relaxed text-subtle">
            Apenas owners do time podem adicionar pessoas.
          </p>
        )}
      </div>
    </Dialog>
  );
}
