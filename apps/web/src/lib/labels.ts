import type {
  AnalysisCategory,
  Depth,
  FindingClassification,
  FindingSource,
  Severity,
} from "./api/types";

export const CATEGORY_LABELS: Record<AnalysisCategory, string> = {
  bugs: "Bugs",
  seguranca: "Segurança",
  performance: "Performance",
  legibilidade: "Legibilidade",
  boas_praticas: "Boas práticas",
};

export const CATEGORY_HINTS: Record<AnalysisCategory, string> = {
  bugs: "Lógica quebrada, erros em tempo de execução",
  seguranca: "Vazamento, injeção, autenticação e afins",
  performance: "Custos desnecessários, complexidade, I/O",
  legibilidade: "Nomes, estrutura e clareza do código",
  boas_praticas: "Convenções, idiomatismo e manutenibilidade",
};

export const CLASSIFICATION_LABELS: Record<FindingClassification, string> = {
  tecnico: "Técnico",
  regra_negocio: "Regra de negócio",
  estilo: "Estilo",
  sugestao: "Sugestão",
};

export const CLASSIFICATION_DESCRIPTIONS: Record<
  FindingClassification,
  string
> = {
  tecnico: "Problema objetivo de implementação, independente do seu projeto.",
  regra_negocio:
    "Conflito com uma regra cadastrada no projeto — a IA não pode inventar regras.",
  estilo: "Questão de forma e consistência do código.",
  sugestao: "Recomendação opcional, sem impacto direto em correção.",
};

export const DEPTH_LABELS: Record<Depth, string> = {
  RAPIDA: "Rápida",
  PADRAO: "Padrão",
  DETALHADA: "Detalhada",
};

export const DEPTH_DESCRIPTIONS: Record<Depth, string> = {
  RAPIDA: "Varredura superficial, ideal para pedidos rápidos.",
  PADRAO: "Equilíbrio entre cobertura e tempo de análise.",
  DETALHADA: "Mergulho fundo no código — mais achados, mais tempo.",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  ALTA: "Alta",
  MEDIA: "Média",
  BAIXA: "Baixa",
};

export const SEVERITY_ORDER: Severity[] = ["ALTA", "MEDIA", "BAIXA"];

export const SEVERITY_CLASSES: Record<
  Severity,
  { text: string; bg: string; border: string; bar: string }
> = {
  ALTA: {
    text: "text-sev-alta",
    bg: "bg-sev-alta-soft",
    border: "border-sev-alta-line",
    bar: "bg-sev-alta",
  },
  MEDIA: {
    text: "text-sev-media",
    bg: "bg-sev-media-soft",
    border: "border-sev-media-line",
    bar: "bg-sev-media",
  },
  BAIXA: {
    text: "text-sev-baixa",
    bg: "bg-sev-baixa-soft",
    border: "border-sev-baixa-line",
    bar: "bg-sev-baixa",
  },
};

export const SOURCE_LABELS: Record<FindingSource, string> = {
  AI: "IA",
  STATIC_ANALYSIS: "Análise estática",
};

export const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "csharp", label: "C#" },
] as const;

export function languageLabel(value: string): string {
  return (
    LANGUAGES.find((l) => l.value === value)?.label ??
    value.charAt(0).toUpperCase() + value.slice(1)
  );
}
