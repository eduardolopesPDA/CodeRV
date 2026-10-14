import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Surface({
  className,
  hover = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface shadow-card",
        hover &&
          "transition-colors duration-150 hover:border-line-strong hover:bg-raised/60",
        className,
      )}
      {...props}
    />
  );
}

export function Panel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface/70 backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}
