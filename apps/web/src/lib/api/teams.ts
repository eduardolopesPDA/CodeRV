import { apiFetch } from "./client";
import type { Role, Team, TeamMember } from "./types";

export interface AddMemberInput {
  email: string;
  role?: Role;
}

export const teamsApi = {
  list: (signal?: AbortSignal) => apiFetch<Team[]>("/teams", { signal }),

  create: (name: string) =>
    apiFetch<Team>("/teams", { method: "POST", body: { name } }),

  listMembers: (teamId: string, signal?: AbortSignal) =>
    apiFetch<TeamMember[]>(`/teams/${teamId}/members`, { signal }),

  addMember: (teamId: string, input: AddMemberInput) =>
    apiFetch<TeamMember>(`/teams/${teamId}/members`, {
      method: "POST",
      body: input,
    }),
};
