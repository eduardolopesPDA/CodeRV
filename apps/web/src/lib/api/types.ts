export type Depth = "RAPIDA" | "PADRAO" | "DETALHADA";
export type Severity = "BAIXA" | "MEDIA" | "ALTA";
export type FindingSource = "STATIC_ANALYSIS" | "AI";
export type FindingClassification =
  | "tecnico"
  | "regra_negocio"
  | "estilo"
  | "sugestao";
export type Role = "OWNER" | "MEMBER";
export type AnalysisCategory =
  | "bugs"
  | "seguranca"
  | "performance"
  | "legibilidade"
  | "boas_praticas";

export const ANALYSIS_CATEGORIES: AnalysisCategory[] = [
  "bugs",
  "seguranca",
  "performance",
  "legibilidade",
  "boas_praticas",
];

export const DEPTHS: Depth[] = ["RAPIDA", "PADRAO", "DETALHADA"];

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: Role;
  user?: { id: string; name: string; email: string };
}

export interface Team {
  id: string;
  name: string;
  createdAt: string;
  members?: TeamMember[];
}

export interface Project {
  id: string;
  teamId: string;
  name: string;
  description: string | null;
  objective: string | null;
  technologies: string[];
  supportedLanguages: string[];
  architecture: string | null;
  conventions: string | null;
  additionalInfo: string | null;
  createdAt: string;
}

export type ProjectPatch = Partial<
  Omit<Project, "id" | "teamId" | "createdAt">
> & {
  description?: string | null;
  objective?: string | null;
  architecture?: string | null;
  conventions?: string | null;
  additionalInfo?: string | null;
};

export interface ProjectInput {
  teamId: string;
  name: string;
  description?: string;
  objective?: string;
  technologies?: string[];
  supportedLanguages?: string[];
  architecture?: string;
  conventions?: string;
  additionalInfo?: string;
}

export interface RuleVersion {
  id: string;
  ruleId: string;
  version: number;
  title: string;
  description: string;
  scope: string | null;
  createdAt: string;
}

export interface RuleListItem {
  id: string;
  identifier: string;
  createdAt: string;
  currentVersion: RuleVersion | null;
}

export interface RuleWithVersions {
  id: string;
  projectId: string;
  identifier: string;
  createdAt: string;
  versions: RuleVersion[];
}

export interface RuleInput {
  identifier: string;
  title: string;
  description: string;
  scope?: string;
}

export interface RuleUpdateInput {
  title: string;
  description: string;
  scope?: string;
}

export interface ContextEntry {
  id: string;
  projectId: string;
  content: string;
  sourceFindingId: string | null;
  createdAt: string;
}

export interface Clarification {
  id: string;
  findingId: string;
  question: string;
  answer: string | null;
  appliedToContext: boolean;
  answeredAt: string | null;
  createdAt: string;
}

export interface Finding {
  id: string;
  analysisId: string;
  category: string;
  classification: FindingClassification;
  location: string;
  description: string;
  evidence: string;
  severity: Severity;
  confidence: number;
  suggestion: string | null;
  source: FindingSource;
  metadata: { ruleId?: string; ruleIdentifier?: string } | null;
  isBlocking: boolean;
  clarifications: Clarification[];
}

export interface Analysis {
  id: string;
  projectId: string;
  code: string;
  language: string;
  depth: Depth;
  categories: string[];
  findings: Finding[];
  categoriesWithNoFindings: string[];
  createdAt: string;
}

export interface CreateAnalysisInput {
  code: string;
  language: string;
  depth: Depth;
  categories: AnalysisCategory[];
  filePath?: string;
}
