import { apiFetch } from "./client";
import type { Project, ProjectInput, ProjectPatch } from "./types";

export const projectsApi = {
  list: (signal?: AbortSignal) => apiFetch<Project[]>("/projects", { signal }),

  get: (id: string, signal?: AbortSignal) =>
    apiFetch<Project>(`/projects/${id}`, { signal }),

  create: (input: ProjectInput) =>
    apiFetch<Project>("/projects", { method: "POST", body: input }),

  update: (id: string, input: ProjectPatch) =>
    apiFetch<Project>(`/projects/${id}`, { method: "PATCH", body: input }),
};
