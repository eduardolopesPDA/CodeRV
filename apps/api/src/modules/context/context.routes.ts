import { Router } from "express";
import { z } from "zod";
import { AuthenticatedRequest, requireAuth } from "../auth/auth.middleware";
import { getProjectById, isTeamMember } from "../projects/projects.service";
import {
  createContextEntry,
  deleteContextEntry,
  FindingNotInProjectError,
  getContextEntryById,
  listContextEntries,
} from "./context.service";

async function assertProjectAccess(projectId: string, userId: string) {
  const project = await getProjectById(projectId);
  if (!project) return { project: null, allowed: false };
  const allowed = await isTeamMember(project.teamId, userId);
  return { project, allowed };
}

export const projectContextRouter = Router({ mergeParams: true });
projectContextRouter.use(requireAuth);

projectContextRouter.get("/", async (req: AuthenticatedRequest, res) => {
  const { project, allowed } = await assertProjectAccess(req.params.projectId, req.userId!);
  if (!project) return res.status(404).json({ error: "NOT_FOUND" });
  if (!allowed) return res.status(403).json({ error: "FORBIDDEN" });

  const entries = await listContextEntries(req.params.projectId);
  res.json(entries);
});

const createEntrySchema = z.object({
  content: z.string().min(1),
  sourceFindingId: z.string().uuid().optional(),
});

projectContextRouter.post("/", async (req: AuthenticatedRequest, res) => {
  const { project, allowed } = await assertProjectAccess(req.params.projectId, req.userId!);
  if (!project) return res.status(404).json({ error: "NOT_FOUND" });
  if (!allowed) return res.status(403).json({ error: "FORBIDDEN" });

  const parsed = createEntrySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const entry = await createContextEntry(
      req.params.projectId,
      parsed.data.content,
      parsed.data.sourceFindingId
    );
    res.status(201).json(entry);
  } catch (err) {
    if (err instanceof FindingNotInProjectError) {
      return res.status(400).json({ error: "FINDING_NOT_IN_PROJECT" });
    }
    throw err;
  }
});

export const contextEntryRouter = Router();
contextEntryRouter.use(requireAuth);

contextEntryRouter.delete("/:id", async (req: AuthenticatedRequest, res) => {
  const entry = await getContextEntryById(req.params.id);
  if (!entry) return res.status(404).json({ error: "NOT_FOUND" });

  const { allowed } = await assertProjectAccess(entry.projectId, req.userId!);
  if (!allowed) return res.status(403).json({ error: "FORBIDDEN" });

  await deleteContextEntry(req.params.id);
  res.status(204).send();
});
