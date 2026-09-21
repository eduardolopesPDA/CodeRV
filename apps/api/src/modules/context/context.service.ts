import { prisma } from "../../infra/prisma/client";

export class FindingNotInProjectError extends Error {}

export async function listContextEntries(projectId: string) {
  return prisma.contextEntry.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });
}

export async function createContextEntry(
  projectId: string,
  content: string,
  sourceFindingId?: string
) {
  if (sourceFindingId) {
    const finding = await prisma.finding.findUnique({
      where: { id: sourceFindingId },
      include: { analysis: true },
    });
    if (!finding || finding.analysis.projectId !== projectId) {
      throw new FindingNotInProjectError();
    }
  }

  return prisma.contextEntry.create({
    data: { projectId, content, sourceFindingId },
  });
}

export async function getContextEntryById(id: string) {
  return prisma.contextEntry.findUnique({ where: { id } });
}

export async function deleteContextEntry(id: string) {
  return prisma.contextEntry.delete({ where: { id } });
}
