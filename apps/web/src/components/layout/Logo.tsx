import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-7 w-7", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" className="fill-raised" />
      <path
        d="M11 10l-5 6 5 6"
        fill="none"
        stroke="#FF8000"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 10l5 6-5 6"
        fill="none"
        stroke="#FF8000"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 9l-3 14"
        fill="none"
        stroke="#F2F4F7"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  to = "/projects",
  className,
}: {
  to?: string;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-2.5 transition-opacity hover:opacity-90",
        className,
      )}
    >
      <LogoMark />
      <span className="text-[15px] font-bold tracking-tight text-ink">
        Code<span className="text-papaya-500">RV</span>
      </span>
    </Link>
  );
}
