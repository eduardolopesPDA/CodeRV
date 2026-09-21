import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "../../infra/prisma/client";

const PASSWORD_SALT_ROUNDS = 10;

export class EmailInUseError extends Error {}

function isUniqueConstraintError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

export async function registerUser(email: string, name: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new EmailInUseError();
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  try {
    return await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        memberships: {
          create: {
            role: "OWNER",
            team: {
              create: { name: `${name}'s Team` },
            },
          },
        },
      },
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new EmailInUseError();
    }
    throw err;
  }
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function validateCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) return null;

  return user;
}
