import type { TeamDTO } from "@code-reviewer/shared";
import { apiFetch } from "./client";

export function listTeams() {
  return apiFetch<TeamDTO[]>("/teams");
}

export function createTeam(name: string) {
  return apiFetch<TeamDTO>("/teams", { method: "POST", body: JSON.stringify({ name }) });
}
