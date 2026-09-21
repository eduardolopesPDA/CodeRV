import { prisma } from "../../infra/prisma/client";

export interface ProjectInput {
  name: string;
  description?: string;
  objective?: string;
  technologies?: string[];
  supportedLanguages?: string[];
  architecture?: string;
  conventions?: string;
  additionalInfo?: string;
}

export async function listProjectsForUser(userId: string) {
  return prisma.project.findMany({
    where: { team: { members: { some: { userId } } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectById(projectId: string) {
  return prisma.project.findUnique({ where: { id: projectId } });
}

export async function isTeamMember(teamId: string, userId: string) {
  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });
  return membership !== null;
}

export async function createProject(teamId: string, input: ProjectInput) {
  return prisma.project.create({
    data: { teamId, ...input },
  });
}

export async function updateProject(projectId: string, input: Partial<ProjectInput>) {
  return prisma.project.update({
    where: { id: projectId },
    data: input,
  });
}
