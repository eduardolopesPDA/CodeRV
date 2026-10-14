import type { ReactNode } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-line px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-raised text-muted">
          {icon}
        </div>
      ) : null}
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-subtle">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card border border-sev-alta-line bg-sev-alta-soft px-6 py-10 text-center",
        className,
      )}
    >
      <AlertTriangle className="h-5 w-5 text-sev-alta" />
      <p className="max-w-md text-[13px] leading-relaxed text-sev-alta">
        {message}
      </p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw className="h-3.5 w-3.5" />
          Tentar de novo
        </Button>
      ) : null}
    </div>
  );
}

type AlertTone = "accent" | "danger" | "warning" | "success" | "info";

const ALERT_TONES: Record<AlertTone, string> = {
  accent: "border-papaya-500/25 bg-papaya-500/10 text-papaya-200",
  danger: "border-sev-alta-line bg-sev-alta-soft text-sev-alta",
  warning: "border-sev-media-line bg-sev-media-soft text-sev-media",
  success: "border-positive-line bg-positive-soft text-positive",
  info: "border-ai-line bg-ai-soft text-ai",
};

export function Alert({
  tone = "info",
  icon,
  title,
  children,
  className,
}: {
  tone?: AlertTone;
  icon?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-card border px-4 py-3",
        ALERT_TONES[tone],
        className,
      )}
    >
      {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
      <div className="min-w-0 text-[13px] leading-relaxed">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? (
          <div className={cn(title && "mt-1 opacity-90")}>{children}</div>
        ) : null}
      </div>
    </div>
  );
}
