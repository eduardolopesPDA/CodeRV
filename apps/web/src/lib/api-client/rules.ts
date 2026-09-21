import type { RuleDTO, RuleVersionDTO } from "@code-reviewer/shared";
import { apiFetch } from "./client";

export function listRules(projectId: string) {
  return apiFetch<RuleDTO[]>(`/projects/${projectId}/rules`);
}

export function createRule(
  projectId: string,
  input: { identifier: string; title: string; description: string; scope?: string }
) {
  return apiFetch(`/projects/${projectId}/rules`, { method: "POST", body: JSON.stringify(input) });
}

export function updateRule(
  ruleId: string,
  input: { title: string; description: string; scope?: string }
) {
  return apiFetch<RuleVersionDTO>(`/rules/${ruleId}`, { method: "PUT", body: JSON.stringify(input) });
}

export function listRuleVersions(ruleId: string) {
  return apiFetch<RuleVersionDTO[]>(`/rules/${ruleId}/versions`);
}
