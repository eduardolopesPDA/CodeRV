import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export function Legend({ className }: { className?: string }) {
  return (
    <details
      className={cn(
        "group rounded-card border border-line bg-surface/60",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-[13px] font-medium text-muted transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
        <HelpCircle className="h-4 w-4 text-subtle" />
        Como ler estes resultados
        <span className="ml-auto text-[11px] text-subtle transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <dl className="grid gap-4 border-t border-line px-4 py-4 text-[13px] sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-ink">Severidade</dt>
          <dd className="mt-1 leading-relaxed text-muted">
            <strong className="text-sev-alta">Alta</strong> exige atenção — com
            dúvida em aberto, ela <em>bloqueia</em> a análise.{" "}
            <strong className="text-sev-media">Média</strong> e{" "}
            <strong className="text-sev-baixa">baixa</strong> são informativas.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Classificação</dt>
          <dd className="mt-1 leading-relaxed text-muted">
            <strong>Regra de negócio</strong> significa conflito com uma regra
            cadastrada — a IA não pode inventar regras.{" "}
            <strong>Técnico</strong>, <strong>estilo</strong> e{" "}
            <strong>sugestão</strong> vêm da leitura do código.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Confiança</dt>
          <dd className="mt-1 leading-relaxed text-muted">
            Estimativa da IA (0–100%) de quão certo ela está daquele achado.
            Análise estática entra sempre com 100%.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Origem</dt>
          <dd className="mt-1 leading-relaxed text-muted">
            <strong>Lint</strong> vem do ESLint ou Ruff. <strong>IA</strong>{" "}
            vem da revisão contextual — já deduplicada contra os achados do
            linter.
          </dd>
        </div>
      </dl>
    </details>
  );
}
