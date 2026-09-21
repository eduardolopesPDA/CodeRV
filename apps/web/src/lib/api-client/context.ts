import type { ContextEntryDTO } from "@code-reviewer/shared";
import { apiFetch } from "./client";

export function listContextEntries(projectId: string) {
  return apiFetch<ContextEntryDTO[]>(`/projects/${projectId}/context`);
}

export function createContextEntry(projectId: string, content: string) {
  return apiFetch<ContextEntryDTO>(`/projects/${projectId}/context`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function deleteContextEntry(id: string) {
  return apiFetch<void>(`/context/${id}`, { method: "DELETE" });
}
