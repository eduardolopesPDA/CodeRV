import { minimatch } from "minimatch";
import { prisma } from "../../infra/prisma/client";

export interface ResolvedRule {
  ruleVersionId: string;
  identifier: string;
  title: string;
  description: string;
  scope: string | null;
}

export async function resolveApplicableRules(
  projectId: string,
  filePath?: string
): Promise<ResolvedRule[]> {
  const rules = await prisma.rule.findMany({
    where: { projectId },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });

  return rules
    .filter((rule) => {
      const current = rule.versions[0];
      if (!current) return false;
      if (!current.scope) return true;
      if (!filePath) return false;
      return minimatch(filePath, current.scope);
    })
    .map((rule) => {
      const current = rule.versions[0];
      return {
        ruleVersionId: current.id,
        identifier: rule.identifier,
        title: current.title,
        description: current.description,
        scope: current.scope,
      };
    });
}
