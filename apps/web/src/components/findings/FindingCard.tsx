import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertOctagon,
  ChevronDown,
  Lightbulb,
  MessageSquare,
  Send,
  ShieldQuestion,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { CodeBlock, ConfidenceMeter } from "@/components/ui/Data";
import { Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import {
  ClassificationBadge,
  SeverityBadge,
  SourceBadge,
} from "@/components/findings/badges";
import { analysisApi } from "@/lib/api/analysis";
import { getApiErrorMessage } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query/keys";
import { SEVERITY_CLASSES } from "@/lib/labels";
import type { Analysis, Finding } from "@/lib/api/types";

interface FindingCardProps {
  analysisId: string;
  finding: Finding;
  onUpdated: (finding: Finding) => void;
  defaultOpen?: boolean;
}

export function FindingCard({
  analysisId,
  finding,
  onUpdated,
  defaultOpen = false,
}: FindingCardProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [open, setOpen] = useState(
    defaultOpen || finding.isBlocking || hasPending(finding),
  );
  const [answer, setAnswer] = useState("");
  const [applyToContext, setApplyToContext] = useState(true);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeMessage, setDisputeMessage] = useState("");

  const pending = pendingClarification(finding);
  const answered = finding.clarifications.filter((c) => c.answeredAt);

  function applyUpdate(updated: Finding) {
    onUpdated(updated);
    const cacheKey = queryKeys.analysis(analysisId);
    queryClient.setQueryData<Analysis>(cacheKey, (previous) =>
      previous
        ? {
            ...previous,
            findings: previous.findings.map((item) =>
              item.id === updated.id ? updated : item,
            ),
          }
        : previous,
    );
  }

  const clarifyMutation = useMutation({
    mutationFn: () =>
      analysisApi.clarify(analysisId, finding.id, {
        answer: answer.trim(),
        applyToContext,
      }),
    onSuccess: (updated) => {
      applyUpdate(updated);
      setAnswer("");
      toast.success(
        "Esclarecimento enviado",
        applyToContext
          ? "A resposta também entrou no contexto permanente do projeto."
          : "A IA reavaliou o achado com a sua resposta.",
      );
    },
    onError: (error) =>
      toast.error(
        "Não foi possível responder",
        getApiErrorMessage(error),
      ),
  });

  const disputeMutation = useMutation({
    mutationFn: () =>
      analysisApi.dispute(analysisId, finding.id, disputeMessage.trim()),
    onSuccess: (updated) => {
      applyUpdate(updated);
      setDisputeMessage("");
      setDisputeOpen(false);
      toast.success("Contestação enviada", "A IA reavaliou o achado.");
    },
    onError: (error) =>
      toast.error("Não foi possível contestar", getApiErrorMessage(error)),
  });

  const busy = clarifyMutation.isPending || disputeMutation.isPending;

  return (
    <li
      className={cn(
        "relative overflow-hidden rounded-card border bg-surface transition-colors",
        finding.isBlocking
          ? "border-sev-alta-line"
          : "border-line hover:border-line-strong",
      )}
    >
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          SEVERITY_CLASSES[finding.severity].bar,
        )}
        aria-hidden
      />

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 py-4 pl-6 pr-4 text-left"
      >
        <span className="min-w-0 flex-1 space-y-2.5">
          <span className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={finding.severity} />
            <ClassificationBadge classification={finding.classification} />
            <SourceBadge source={finding.source} />
            {finding.source === "AI" ? (
              <ConfidenceMeter value={finding.confidence} />
            ) : null}
            <span className="mono-chip ml-auto max-w-full truncate">
              {finding.location}
            </span>
          </span>
          <span
            className={cn(
              "block text-[13px] leading-relaxed text-muted",
              !open && "line-clamp-2",
            )}
          >
            {finding.description}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-subtle transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="space-y-4 border-t border-line py-4 pl-6 pr-4">
          {finding.isBlocking ? (
            <div className="flex gap-2.5 rounded-field border border-sev-alta-line bg-sev-alta-soft px-3 py-2.5 text-[13px] leading-relaxed text-sev-alta">
              <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {pending
                  ? "Este achado está bloqueando a análise até você responder à dúvida abaixo."
                  : "A IA reavaliou este achado e ele continua bloqueando a revisão."}
              </span>
            </div>
          ) : null}

          <section>
            <SectionTitle icon={<MessageSquare className="h-3.5 w-3.5" />}>
              Evidência
            </SectionTitle>
            <CodeBlock className="mt-2">{finding.evidence}</CodeBlock>
          </section>

          {finding.suggestion ? (
            <section>
              <SectionTitle icon={<Lightbulb className="h-3.5 w-3.5" />}>
                Sugestão
              </SectionTitle>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {finding.suggestion}
              </p>
            </section>
          ) : null}

          {finding.metadata?.ruleIdentifier || finding.metadata?.ruleId ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-subtle">
                Regra aplicada:
              </span>
              <Badge tone="accent">
                <span className="font-mono">
                  {finding.metadata.ruleIdentifier ?? finding.metadata.ruleId}
                </span>
              </Badge>
            </div>
          ) : null}

          {answered.length > 0 ? (
            <section className="space-y-2">
              <SectionTitle>Esclarecimentos</SectionTitle>
              {answered.map((clarification) => (
                <div
                  key={clarification.id}
                  className="rounded-field border border-line bg-raised/50 px-3 py-2.5"
                >
                  <p className="text-[12px] font-medium text-papaya-300">
                    {clarification.question}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                    {clarification.answer}
                  </p>
                  {clarification.appliedToContext ? (
                    <p className="mt-2 text-[11px] text-positive">
                      Salvo como contexto permanente do projeto.
                    </p>
                  ) : null}
                </div>
              ))}
            </section>
          ) : null}

          {pending ? (
            <section className="rounded-field border border-sev-media-line bg-sev-media-soft/50 p-3.5">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-sev-media">
                <ShieldQuestion className="h-4 w-4" />
                A IA precisa de uma definição
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink/90">
                {pending.question}
              </p>
              <div className="mt-3 space-y-3">
                <Textarea
                  rows={3}
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Explique como o seu time trata este caso..."
                  aria-label="Sua resposta"
                />
                <Checkbox
                  checked={applyToContext}
                  onChange={(event) => setApplyToContext(event.target.checked)}
                  label="Salvar esta resposta como contexto permanente"
                  description="A próxima análise já nasce sabendo dessa decisão."
                />
                <Button
                  size="sm"
                  loading={clarifyMutation.isPending}
                  disabled={answer.trim().length === 0 || busy}
                  onClick={() => clarifyMutation.mutate()}
                >
                  <Send className="h-3.5 w-3.5" />
                  Responder e reavaliar
                </Button>
              </div>
            </section>
          ) : null}

          <section>
            {!disputeOpen ? (
              <button
                type="button"
                onClick={() => setDisputeOpen(true)}
                className="text-[12px] font-semibold text-subtle underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                Contestar esta conclusão
              </button>
            ) : (
              <div className="space-y-3 rounded-field border border-line bg-raised/40 p-3.5">
                <p className="text-[13px] font-semibold text-ink">
                  Por que este achado não se aplica?
                </p>
                <Textarea
                  rows={3}
                  value={disputeMessage}
                  onChange={(event) => setDisputeMessage(event.target.value)}
                  placeholder="Conte o contexto que a IA não tinha..."
                  aria-label="Mensagem de contestação"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    loading={disputeMutation.isPending}
                    disabled={disputeMessage.trim().length === 0 || busy}
                    onClick={() => disputeMutation.mutate()}
                  >
                    Enviar contestação
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDisputeOpen(false)}
                    disabled={busy}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </li>
  );
}

function SectionTitle({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <h4 className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
      {icon}
      {children}
    </h4>
  );
}

function hasPending(finding: Finding): boolean {
  return finding.clarifications.some((item) => !item.answeredAt);
}

function pendingClarification(finding: Finding) {
  const open = finding.clarifications.filter((item) => !item.answeredAt);
  return open[open.length - 1];
}
