import { Router } from "express";
import { z } from "zod";
import { AuthenticatedRequest, requireAuth } from "../auth/auth.middleware";
import {
  createProject,
  getProjectById,
  isTeamMember,
  listProjectsForUser,
  updateProject,
} from "./projects.service";

export const projectsRouter = Router();

projectsRouter.use(requireAuth);

projectsRouter.get("/", async (req: AuthenticatedRequest, res) => {
  const projects = await listProjectsForUser(req.userId!);
  res.json(projects);
});

const projectInputSchema = z.object({
  teamId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  objective: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  supportedLanguages: z.array(z.string()).optional(),
  architecture: z.string().optional(),
  conventions: z.string().optional(),
  additionalInfo: z.string().optional(),
});

projectsRouter.post("/", async (req: AuthenticatedRequest, res) => {
  const parsed = projectInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { teamId, ...input } = parsed.data;
  const member = await isTeamMember(teamId, req.userId!);
  if (!member) {
    return res.status(403).json({ error: "FORBIDDEN" });
  }

  const project = await createProject(teamId, input);
  res.status(201).json(project);
});

projectsRouter.get("/:id", async (req: AuthenticatedRequest, res) => {
  const project = await getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ error: "NOT_FOUND" });
  }

  const member = await isTeamMember(project.teamId, req.userId!);
  if (!member) {
    return res.status(403).json({ error: "FORBIDDEN" });
  }

  res.json(project);
});

const projectUpdateSchema = projectInputSchema.omit({ teamId: true }).partial();

projectsRouter.patch("/:id", async (req: AuthenticatedRequest, res) => {
  const project = await getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ error: "NOT_FOUND" });
  }

  const member = await isTeamMember(project.teamId, req.userId!);
  if (!member) {
    return res.status(403).json({ error: "FORBIDDEN" });
  }

  const parsed = projectUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const updated = await updateProject(req.params.id, parsed.data);
  res.json(updated);
});
