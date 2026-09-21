import { Prisma } from "@prisma/client";
import { prisma } from "../../infra/prisma/client";

export class UserNotFoundError extends Error {}
export class AlreadyMemberError extends Error {}

function isUniqueConstraintError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

export async function listTeamsForUser(userId: string) {
  return prisma.team.findMany({
    where: { members: { some: { userId } } },
    include: { members: true },
  });
}

export async function createTeam(userId: string, name: string) {
  return prisma.team.create({
    data: {
      name,
      members: {
        create: { userId, role: "OWNER" },
      },
    },
    include: { members: true },
  });
}

export async function getTeamMembership(teamId: string, userId: string) {
  return prisma.teamMember.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });
}

export async function listTeamMembers(teamId: string) {
  return prisma.teamMember.findMany({
    where: { teamId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export async function addTeamMember(teamId: string, email: string, role: "OWNER" | "MEMBER") {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new UserNotFoundError();

  const existing = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: user.id, teamId } },
  });
  if (existing) throw new AlreadyMemberError();

  try {
    return await prisma.teamMember.create({
      data: { teamId, userId: user.id, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new AlreadyMemberError();
    }
    throw err;
  }
}
