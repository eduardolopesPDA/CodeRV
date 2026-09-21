import type { ProjectDTO } from "@code-reviewer/shared";
import { apiFetch } from "./client";

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

export function listProjects() {
  return apiFetch<ProjectDTO[]>("/projects");
}

export function getProject(id: string) {
  return apiFetch<ProjectDTO>(`/projects/${id}`);
}

export function createProject(input: ProjectInput) {
  return apiFetch<ProjectDTO>("/projects", { method: "POST", body: JSON.stringify(input) });
}

export function updateProject(id: string, input: Partial<Omit<ProjectInput, "teamId">>) {
  return apiFetch<ProjectDTO>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}
