import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-papaya-500 text-white hover:bg-papaya-400 active:bg-papaya-600 disabled:bg-papaya-500/40 shadow-[0_1px_0_0_rgb(255_255_255/0.2)_inset]",
  secondary:
    "bg-raised text-ink hover:bg-overlay border border-line-strong disabled:opacity-50",
  ghost:
    "bg-transparent text-muted hover:bg-raised hover:text-ink disabled:opacity-50",
  outline:
    "border border-line-strong bg-transparent text-ink hover:border-papaya-500/50 hover:text-papaya-300 disabled:opacity-50",
  danger:
    "bg-sev-alta-soft text-sev-alta border border-sev-alta-line hover:bg-sev-alta/20 disabled:opacity-50",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
};

export const buttonVariants = ({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) =>
  cn(
    "inline-flex select-none items-center justify-center whitespace-nowrap rounded-full font-semibold transition-colors duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-papaya-500",
    "disabled:cursor-not-allowed disabled:opacity-60",
    VARIANTS[variant],
    SIZES[size],
    className,
  );

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size={size === "sm" ? "sm" : "md"} className="opacity-90" />
      ) : null}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
