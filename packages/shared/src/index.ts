export type Depth = "RAPIDA" | "PADRAO" | "DETALHADA";

export type Severity = "BAIXA" | "MEDIA" | "ALTA";

export type FindingSource = "STATIC_ANALYSIS" | "AI";

export type FindingClassification =
  | "tecnico"
  | "regra_negocio"
  | "estilo"
  | "sugestao";

export type Role = "OWNER" | "MEMBER";

export interface ClarificationDTO {
  id: string;
  findingId: string;
  question: string;
  answer?: string | null;
  appliedToContext: boolean;
  answeredAt?: string | null;
  createdAt: string;
}

export interface FindingDTO {
  id: string;
  category: string;
  classification: FindingClassification;
  location: string;
  description: string;
  evidence: string;
  severity: Severity;
  confidence: number;
  suggestion?: string | null;
  source: FindingSource;
  isBlocking: boolean;
  clarifications: ClarificationDTO[];
}

export interface AnalysisDTO {
  id: string;
  projectId: string;
  language: string;
  depth: Depth;
  categories: string[];
  findings: FindingDTO[];
  categoriesWithNoFindings: string[];
  createdAt: string;
}

export interface TeamMemberDTO {
  id: string;
  userId: string;
  teamId: string;
  role: Role;
  user?: { id: string; name: string; email: string };
}

export interface TeamDTO {
  id: string;
  name: string;
  members?: TeamMemberDTO[];
  createdAt: string;
}

export interface ProjectDTO {
  id: string;
  teamId: string;
  name: string;
  description?: string | null;
  objective?: string | null;
  technologies: string[];
  supportedLanguages: string[];
  architecture?: string | null;
  conventions?: string | null;
  additionalInfo?: string | null;
  createdAt: string;
}

export interface RuleVersionDTO {
  id: string;
  ruleId: string;
  version: number;
  title: string;
  description: string;
  scope?: string | null;
  createdAt: string;
}

export interface RuleDTO {
  id: string;
  identifier: string;
  createdAt: string;
  currentVersion: RuleVersionDTO | null;
}

export interface ContextEntryDTO {
  id: string;
  projectId: string;
  content: string;
  sourceFindingId?: string | null;
  createdAt: string;
}
