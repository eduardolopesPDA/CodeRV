import { Prisma } from "@prisma/client";
import { prisma } from "../../infra/prisma/client";

function isUniqueConstraintError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

export interface RuleVersionInput {
  title: string;
  description: string;
  scope?: string;
}

export async function listRulesForProject(projectId: string) {
  const rules = await prisma.rule.findMany({
    where: { projectId },
    include: {
      versions: {
        orderBy: { version: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return rules.map((rule) => ({
    id: rule.id,
    identifier: rule.identifier,
    createdAt: rule.createdAt,
    currentVersion: rule.versions[0] ?? null,
  }));
}

export async function getRuleById(ruleId: string) {
  return prisma.rule.findUnique({ where: { id: ruleId } });
}

export async function listRuleVersions(ruleId: string) {
  return prisma.ruleVersion.findMany({
    where: { ruleId },
    orderBy: { version: "asc" },
  });
}

export async function createRule(
  projectId: string,
  input: RuleVersionInput & { identifier: string }
) {
  return prisma.rule.create({
    data: {
      projectId,
      identifier: input.identifier,
      versions: {
        create: {
          version: 1,
          title: input.title,
          description: input.description,
          scope: input.scope,
        },
      },
    },
    include: { versions: true },
  });
}

const MAX_VERSION_CREATE_ATTEMPTS = 5;

export async function createRuleVersion(ruleId: string, input: RuleVersionInput) {
  for (let attempt = 0; attempt < MAX_VERSION_CREATE_ATTEMPTS; attempt++) {
    const latest = await prisma.ruleVersion.findFirst({
      where: { ruleId },
      orderBy: { version: "desc" },
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    try {
      return await prisma.ruleVersion.create({
        data: {
          ruleId,
          version: nextVersion,
          title: input.title,
          description: input.description,
          scope: input.scope,
        },
      });
    } catch (err) {
      if (!isUniqueConstraintError(err)) throw err;
    }
  }

  throw new Error("Não foi possível criar a nova versão da regra após múltiplas tentativas");
}
