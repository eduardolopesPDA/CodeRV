export type AnalysisCategory =
  | "bugs"
  | "seguranca"
  | "performance"
  | "legibilidade"
  | "boas_praticas";

export interface StaticFinding {
  location: string;
  description: string;
  evidence: string;
  ruleId: string;
  category: AnalysisCategory;
  severity: "BAIXA" | "MEDIA" | "ALTA";
}

export interface Analyzer {
  language: string;
  analyze(code: string): Promise<StaticFinding[]>;
}
