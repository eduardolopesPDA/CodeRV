import type { AnalysisDTO, FindingDTO } from "@code-reviewer/shared";
import { ApiError, apiFetch } from "./client";

const AI_ERROR_MESSAGES: Record<string, string> = {
  AI_NOT_CONFIGURED: "A análise por IA não está configurada (falta LLM_API_KEY no backend).",
  AI_TIMEOUT: "A IA demorou demais para responder. Tente novamente em instantes.",
  TOO_MANY_AI_REQUESTS: "Muitas análises em pouco tempo. Aguarde alguns minutos e tente novamente.",
  AI_PROVIDER_RATE_LIMITED: "O provedor de IA está com limite de uso atingido no momento. Tente novamente em instantes.",
};

export function getAiErrorMessage(err: unknown): string | null {
  if (!(err instanceof ApiError)) return null;
  const code = (err.body as { error?: string } | null)?.error;
  return code ? (AI_ERROR_MESSAGES[code] ?? null) : null;
}

export interface CreateAnalysisInput {
  code: string;
  language: string;
  depth: "RAPIDA" | "PADRAO" | "DETALHADA";
  categories: string[];
  filePath?: string;
}

export function createAnalysis(projectId: string, input: CreateAnalysisInput) {
  return apiFetch<AnalysisDTO>(`/projects/${projectId}/analyses`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getAnalysis(id: string) {
  return apiFetch<AnalysisDTO>(`/analyses/${id}`);
}

export function clarifyFinding(
  analysisId: string,
  findingId: string,
  answer: string,
  applyToContext: boolean
) {
  return apiFetch<FindingDTO>(`/analyses/${analysisId}/findings/${findingId}/clarify`, {
    method: "POST",
    body: JSON.stringify({ answer, applyToContext }),
  });
}

export function disputeFinding(analysisId: string, findingId: string, message: string) {
  return apiFetch<FindingDTO>(`/analyses/${analysisId}/findings/${findingId}/dispute`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
