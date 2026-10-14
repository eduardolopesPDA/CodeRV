export const queryKeys = {
  me: ["auth", "me"] as const,
  teams: ["teams"] as const,
  teamMembers: (teamId: string) => ["teams", teamId, "members"] as const,
  projects: ["projects"] as const,
  project: (projectId: string) => ["projects", projectId] as const,
  rules: (projectId: string) => ["projects", projectId, "rules"] as const,
  ruleVersions: (ruleId: string) => ["rules", ruleId, "versions"] as const,
  context: (projectId: string) => ["projects", projectId, "context"] as const,
  analysis: (analysisId: string) => ["analyses", analysisId] as const,
};
