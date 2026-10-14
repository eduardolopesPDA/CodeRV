import { useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Filter, Sparkles, Terminal } from "lucide-react";
import { cn } from "@/lib/cn";
import { Surface } from "@/components/ui/Surface";
import { EmptyState } from "@/components/ui/States";
import { FindingCard } from "@/components/findings/FindingCard";
import { Legend } from "@/components/findings/Legend";
import { formatRelative, plural } from "@/lib/format";
import {
  DEPTH_LABELS,
  SEVERITY_CLASSES,
  SEVERITY_LABELS,
  SOURCE_LABELS,
} from "@/lib/labels";
import type {
  Analysis,
  Finding,
  FindingSource,
  Severity,
} from "@/lib/api/types";
import { SEVERITY_ORDER } from "@/lib/labels";

const SOURCES: FindingSource[] = ["AI", "STATIC_ANALYSIS"];

export function AnalysisResults({ analysis }: { analysis: Analysis }) {
  const [severities, setSeverities] = useState<Severity[]>([]);
  const [sources, setSources] = useState<FindingSource[]>([]);
  const [onlyBlocking, setOnlyBlocking] = useState(false);

  const counts = useMemo(() => {
    const map: Record<Severity, number> = { ALTA: 0, MEDIA: 0, BAIXA: 0 };
    analysis.findings.forEach((finding) => {
      map[finding.severity] += 1;
    });
    return map;
  }, [analysis.findings]);

  const blockingCount = analysis.findings.filter((f) => f.isBlocking).length;

  const visible = useMemo(() => {
    const list = analysis.findings.filter((finding) => {
      if (severities.length > 0 && !severities.includes(finding.severity))
        return false;
      if (sources.length > 0 && !sources.includes(finding.source)) return false;
      if (onlyBlocking && !finding.isBlocking) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      if (a.isBlocking !== b.isBlocking) return a.isBlocking ? -1 : 1;
      const severityDiff =
        SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
      if (severityDiff !== 0) return severityDiff;
      return b.confidence - a.confidence;
    });
  }, [analysis.findings, severities, sources, onlyBlocking]);

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];
  }

  const hasFilters =
    severities.length > 0 || sources.length > 0 || onlyBlocking;

  return (
    <div className="space-y-4">
      <Surface className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Resultados</h2>
            <p className="mt-1 text-[11px] text-subtle">
              {DEPTH_LABELS[analysis.depth]} · {formatRelative(analysis.createdAt)}{" "}
              · {plural(analysis.findings.length, "achado", "achados")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {SEVERITY_ORDER.map((severity) => (
              <div
                key={severity}
                className="flex items-center gap-1.5"
                title={SEVERITY_LABELS[severity]}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    SEVERITY_CLASSES[severity].bar,
                  )}
                  aria-hidden
                />
                <span className="font-mono text-sm font-semibold text-ink">
                  {counts[severity]}
                </span>
                <span className="text-[11px] text-subtle">
                  {SEVERITY_LABELS[severity].toLowerCase()}
                </span>
              </div>
            ))}
            {blockingCount > 0 ? (
              <span className="rounded-full border border-sev-alta-line bg-sev-alta-soft px-2.5 py-1 text-[11px] font-semibold text-sev-alta">
                {plural(blockingCount, "bloqueio", "bloqueios")}
              </span>
            ) : (
              <span className="rounded-full border border-positive-line bg-positive-soft px-2.5 py-1 text-[11px] font-semibold text-positive">
                sem bloqueios
              </span>
            )}
          </div>
        </div>

        {analysis.categoriesWithNoFindings.length > 0 ? (
          <div className="mt-4 flex items-start gap-2.5 rounded-field border border-positive-line bg-positive-soft px-3 py-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-positive" />
            <p className="text-[13px] leading-relaxed text-positive">
              Nada encontrado em{" "}
              {analysis.categoriesWithNoFindings.join(", ")}.
            </p>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-subtle">
            <Filter className="h-3.5 w-3.5" />
            Filtros
          </span>

          {SEVERITY_ORDER.map((severity) => (
            <FilterChip
              key={severity}
              active={severities.includes(severity)}
              onClick={() => setSeverities((prev) => toggle(prev, severity))}
              dotClass={SEVERITY_CLASSES[severity].bar}
            >
              {SEVERITY_LABELS[severity]}
            </FilterChip>
          ))}

          {SOURCES.map((source) => (
            <FilterChip
              key={source}
              active={sources.includes(source)}
              onClick={() => setSources((prev) => toggle(prev, source))}
            >
              {source === "AI" ? (
                <Sparkles className="h-3 w-3" />
              ) : (
                <Terminal className="h-3 w-3" />
              )}
              {SOURCE_LABELS[source]}
            </FilterChip>
          ))}

          <FilterChip
            active={onlyBlocking}
            onClick={() => setOnlyBlocking((value) => !value)}
          >
            Só bloqueios
          </FilterChip>

          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setSeverities([]);
                setSources([]);
                setOnlyBlocking(false);
              }}
              className="ml-auto text-[11px] font-semibold text-subtle underline-offset-4 hover:text-ink hover:underline"
            >
              Limpar filtros
            </button>
          ) : null}
        </div>
      </Surface>

      <Legend />

      {visible.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="h-5 w-5" />}
          title={
            analysis.findings.length === 0
              ? "Nenhum achado nesta rodada"
              : "Nada passa pelos filtros"
          }
          description={
            analysis.findings.length === 0
              ? "O código passou pelas regras cadastradas, pelo linter e pela revisão da IA sem apontamentos."
              : "Ajuste ou limpe os filtros para ver os outros achados."
          }
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((finding) => (
            <ResultItem
              key={finding.id}
              analysisId={analysis.id}
              finding={finding}
              onUpdated={handleFindingUpdated}
            />
          ))}
        </ul>
      )}
    </div>
  );

  function handleFindingUpdated(_updated: Finding) {
    /* o cache da análise já é atualizado dentro do FindingCard */
  }
}

function ResultItem({
  analysisId,
  finding,
  onUpdated,
}: {
  analysisId: string;
  finding: Finding;
  onUpdated: (finding: Finding) => void;
}) {
  return (
    <FindingCard
      analysisId={analysisId}
      finding={finding}
      onUpdated={onUpdated}
      defaultOpen={finding.isBlocking}
    />
  );
}

function FilterChip({
  active,
  onClick,
  dotClass,
  children,
}: {
  active: boolean;
  onClick: () => void;
  dotClass?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
        active
          ? "border-papaya-500/40 bg-papaya-500/12 text-papaya-300"
          : "border-line-strong bg-raised text-muted hover:text-ink",
      )}
    >
      {dotClass ? (
        <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} aria-hidden />
      ) : null}
      {children}
    </button>
  );
}
