import { Router } from "express";
import { z } from "zod";
import { AuthenticatedRequest, requireAuth } from "../auth/auth.middleware";
import {
  addTeamMember,
  AlreadyMemberError,
  createTeam,
  getTeamMembership,
  listTeamMembers,
  listTeamsForUser,
  UserNotFoundError,
} from "./teams.service";

export const teamsRouter = Router();

teamsRouter.use(requireAuth);

teamsRouter.get("/", async (req: AuthenticatedRequest, res) => {
  const teams = await listTeamsForUser(req.userId!);
  res.json(teams);
});

const createTeamSchema = z.object({
  name: z.string().min(1),
});

teamsRouter.post("/", async (req: AuthenticatedRequest, res) => {
  const parsed = createTeamSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const team = await createTeam(req.userId!, parsed.data.name);
  res.status(201).json(team);
});

teamsRouter.get("/:teamId/members", async (req: AuthenticatedRequest, res) => {
  const membership = await getTeamMembership(req.params.teamId, req.userId!);
  if (!membership) {
    return res.status(403).json({ error: "FORBIDDEN" });
  }

  const members = await listTeamMembers(req.params.teamId);
  res.json(members);
});

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["OWNER", "MEMBER"]).default("MEMBER"),
});

teamsRouter.post("/:teamId/members", async (req: AuthenticatedRequest, res) => {
  const membership = await getTeamMembership(req.params.teamId, req.userId!);
  if (!membership || membership.role !== "OWNER") {
    return res.status(403).json({ error: "FORBIDDEN" });
  }

  const parsed = addMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const member = await addTeamMember(req.params.teamId, parsed.data.email, parsed.data.role);
    res.status(201).json(member);
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }
    if (err instanceof AlreadyMemberError) {
      return res.status(409).json({ error: "ALREADY_MEMBER" });
    }
    throw err;
  }
});
