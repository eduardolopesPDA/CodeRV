import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone =
  | "neutral"
  | "accent"
  | "alta"
  | "media"
  | "baixa"
  | "positive"
  | "ai"
  | "static";

const TONES: Record<Tone, string> = {
  neutral: "border-line-strong bg-raised text-muted",
  accent: "border-papaya-500/30 bg-papaya-500/10 text-papaya-300",
  alta: "border-sev-alta-line bg-sev-alta-soft text-sev-alta",
  media: "border-sev-media-line bg-sev-media-soft text-sev-media",
  baixa: "border-sev-baixa-line bg-sev-baixa-soft text-sev-baixa",
  positive: "border-positive-line bg-positive-soft text-positive",
  ai: "border-ai-line bg-ai-soft text-ai",
  static: "border-line-strong bg-raised text-muted",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  tone = "neutral",
  size = "sm",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        TONES[tone],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      ) : null}
      {children}
    </span>
  );
}
