import { History } from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { formatRelative } from "@/lib/format";
import { DEPTH_LABELS, languageLabel } from "@/lib/labels";
import type { LocalAnalysisEntry } from "@/lib/storage";

interface LocalHistoryProps {
  entries: LocalAnalysisEntry[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function LocalHistory({
  entries,
  activeId,
  onSelect,
}: LocalHistoryProps) {
  if (entries.length === 0) return null;

  return (
    <Surface className="p-4">
      <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
        <History className="h-4 w-4 text-subtle" />
        Análises recentes
      </h3>
      <p className="mt-1 text-[11px] leading-relaxed text-subtle">
        Guardadas neste navegador — a API não expõe histórico.
      </p>
      <ul className="mt-3 space-y-1">
        {entries.slice(0, 6).map((entry) => {
          const active = entry.id === activeId;
          return (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => onSelect(entry.id)}
                className={
                  "flex w-full items-center justify-between gap-2 rounded-field px-2.5 py-2 text-left transition-colors " +
                  (active
                    ? "bg-papaya-500/10 text-papaya-300"
                    : "text-muted hover:bg-raised hover:text-ink")
                }
              >
                <span className="min-w-0 truncate text-[12px] font-medium">
                  {languageLabel(entry.language)} ·{" "}
                  {DEPTH_LABELS[entry.depth as keyof typeof DEPTH_LABELS] ??
                    entry.depth}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-subtle">
                  {formatRelative(entry.createdAt)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Surface>
  );
}
