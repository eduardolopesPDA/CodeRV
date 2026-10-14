import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Checkbox({
  label,
  description,
  className,
  ...props
}: {
  label: ReactNode;
  description?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={cn(
        "group flex cursor-pointer items-start gap-2.5 rounded-field border border-transparent px-2 py-1.5 transition-colors hover:border-line hover:bg-raised/60",
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-[5px] border border-line-strong bg-surface transition-colors checked:border-papaya-500 checked:bg-papaya-500 indeterminate:border-papaya-500 indeterminate:bg-papaya-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-papaya-500"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%230B0C10' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3.5 8.5 6.5 11.5 12.5 4.5'/%3E%3C/svg%3E\")",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
        }}
        {...props}
      />
      <span className="min-w-0">
        <span className="block text-[13px] font-medium leading-tight text-ink">
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-snug text-subtle">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}
