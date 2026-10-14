import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function ConfidenceMeter({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const tone =
    clamped >= 80
      ? "bg-positive"
      : clamped >= 50
        ? "bg-sev-media"
        : "bg-sev-alta";

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      title={`Confiança da IA: ${clamped}%`}
    >
      <div
        className="h-1 w-16 overflow-hidden rounded-full bg-raised"
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Nível de confiança"
      >
        <div
          className={cn("h-full rounded-full transition-all", tone)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="font-mono text-[11px] text-subtle">{clamped}%</span>
    </div>
  );
}

export function CodeBlock({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-field border border-line bg-bg/80 px-3 py-2.5 font-mono text-xs leading-relaxed text-muted",
        className,
      )}
    >
      <code>{children}</code>
    </pre>
  );
}
