import { apiFetch } from "./client";
import type { Analysis, CreateAnalysisInput, Finding } from "./types";

const AI_TIMEOUT_MS = 90_000;

export const analysisApi = {
  create: (projectId: string, input: CreateAnalysisInput, signal?: AbortSignal) =>
    apiFetch<Analysis>(`/projects/${projectId}/analyses`, {
      method: "POST",
      body: input,
      signal,
      timeoutMs: AI_TIMEOUT_MS,
    }),

  get: (id: string, signal?: AbortSignal) =>
    apiFetch<Analysis>(`/analyses/${id}`, { signal, timeoutMs: 30_000 }),

  clarify: (
    analysisId: string,
    findingId: string,
    input: { answer: string; applyToContext?: boolean },
    signal?: AbortSignal,
  ) =>
    apiFetch<Finding>(
      `/analyses/${analysisId}/findings/${findingId}/clarify`,
      { method: "POST", body: input, signal, timeoutMs: AI_TIMEOUT_MS },
    ),

  dispute: (
    analysisId: string,
    findingId: string,
    message: string,
    signal?: AbortSignal,
  ) =>
    apiFetch<Finding>(
      `/analyses/${analysisId}/findings/${findingId}/dispute`,
      {
        method: "POST",
        body: { message },
        signal,
        timeoutMs: AI_TIMEOUT_MS,
      },
    ),
};
