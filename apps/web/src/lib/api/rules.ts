import { apiFetch } from "./client";
import type {
  RuleInput,
  RuleListItem,
  RuleUpdateInput,
  RuleVersion,
  RuleWithVersions,
} from "./types";

export const rulesApi = {
  list: (projectId: string, signal?: AbortSignal) =>
    apiFetch<RuleListItem[]>(`/projects/${projectId}/rules`, { signal }),

  create: (projectId: string, input: RuleInput) =>
    apiFetch<RuleWithVersions>(`/projects/${projectId}/rules`, {
      method: "POST",
      body: input,
    }),

  versions: (ruleId: string, signal?: AbortSignal) =>
    apiFetch<RuleVersion[]>(`/rules/${ruleId}/versions`, { signal }),

  update: (ruleId: string, input: RuleUpdateInput) =>
    apiFetch<RuleVersion>(`/rules/${ruleId}`, {
      method: "PUT",
      body: input,
    }),
};
