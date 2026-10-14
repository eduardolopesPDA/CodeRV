import type { ReactNode } from "react";
import { CheckCheck, GitBranch, Sparkles } from "lucide-react";
import { LogoMark } from "@/components/layout/Logo";
import { Surface } from "@/components/ui/Surface";

const PILLARS = [
  {
    icon: CheckCheck,
    title: "Regras como fonte de verdade",
    description:
      "A IA não inventa convenções: ela compara o código com as regras que o seu time cadastrou.",
  },
  {
    icon: GitBranch,
    title: "Estática + IA no mesmo relatório",
    description:
      "ESLint e Ruff entregam o óbvio; a IA entra onde o linter não alcança — com contexto do projeto.",
  },
  {
    icon: Sparkles,
    title: "Dúvidas viram contexto permanente",
    description:
      "Achados de severidade alta bloqueiam até serem esclarecidos, e as respostas ficam no projeto.",
  },
];

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-bg lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden border-r border-line lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="surface-grid absolute inset-0 opacity-60" aria-hidden />
        <div
          className="absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-papaya-600/20 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-racingblue-700/30 blur-3xl"
          aria-hidden
        />

        <div className="relative flex items-center gap-3">
          <LogoMark className="h-9 w-9" />
          <span className="text-lg font-bold tracking-tight text-ink">
            Code<span className="text-papaya-500">RV</span>
          </span>
        </div>

        <div className="relative max-w-md">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-papaya-400">
            Revisão de código
          </p>
          <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-ink">
            Seu código revisado com as regras do seu time.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Análise estática e IA trabalhando juntas — sempre ancoradas no
            contexto e nas convenções que vocês cadastraram.
          </p>

          <ul className="mt-10 space-y-5">
            {PILLARS.map((pillar) => (
              <li key={pillar.title} className="flex gap-3.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-field border border-papaya-500/25 bg-papaya-500/10 text-papaya-400">
                  <pillar.icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[13px] font-semibold text-ink">
                    {pillar.title}
                  </span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-subtle">
                    {pillar.description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-subtle">
          Análise estática · IA · Regras versionadas · Times
        </p>
      </div>

      <div className="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <LogoMark className="h-8 w-8" />
            <span className="text-base font-bold tracking-tight text-ink">
              Code<span className="text-papaya-500">RV</span>
            </span>
          </div>

          <Surface className="border-line p-6 sm:p-8">
            <h2 className="text-xl font-bold tracking-tight text-ink">{title}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              {subtitle}
            </p>
            <div className="mt-6">{children}</div>
          </Surface>

          <div className="mt-6 text-center text-[13px] text-muted">{footer}</div>
        </div>
      </div>
    </div>
  );
}
