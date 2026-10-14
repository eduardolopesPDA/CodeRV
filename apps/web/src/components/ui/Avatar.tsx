import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

const SIZES = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
} as const;

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br from-papaya-500 to-papaya-700 font-bold text-white ring-1 ring-white/10",
        SIZES[size],
        className,
      )}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
