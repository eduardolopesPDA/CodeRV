import { apiFetch } from "./client";
import type { ContextEntry } from "./types";

export const contextApi = {
  list: (projectId: string, signal?: AbortSignal) =>
    apiFetch<ContextEntry[]>(`/projects/${projectId}/context`, { signal }),

  create: (projectId: string, content: string, sourceFindingId?: string) =>
    apiFetch<ContextEntry>(`/projects/${projectId}/context`, {
      method: "POST",
      body: { content, sourceFindingId },
    }),

  remove: (id: string) =>
    apiFetch<void>(`/context/${id}`, { method: "DELETE" }),
};
