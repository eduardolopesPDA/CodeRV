import { Router } from "express";
import { z } from "zod";
import { AuthenticatedRequest, requireAuth } from "../auth/auth.middleware";
import { getProjectById, isTeamMember } from "../projects/projects.service";
import {
  createRule,
  createRuleVersion,
  getRuleById,
  listRulesForProject,
  listRuleVersions,
} from "./rules.service";

async function assertProjectAccess(projectId: string, userId: string) {
  const project = await getProjectById(projectId);
  if (!project) return { project: null, allowed: false };
  const allowed = await isTeamMember(project.teamId, userId);
  return { project, allowed };
}

export const projectRulesRouter = Router({ mergeParams: true });
projectRulesRouter.use(requireAuth);

projectRulesRouter.get("/", async (req: AuthenticatedRequest, res) => {
  const { project, allowed } = await assertProjectAccess(req.params.projectId, req.userId!);
  if (!project) return res.status(404).json({ error: "NOT_FOUND" });
  if (!allowed) return res.status(403).json({ error: "FORBIDDEN" });

  const rules = await listRulesForProject(req.params.projectId);
  res.json(rules);
});

const createRuleSchema = z.object({
  identifier: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  scope: z.string().optional(),
});

projectRulesRouter.post("/", async (req: AuthenticatedRequest, res) => {
  const { project, allowed } = await assertProjectAccess(req.params.projectId, req.userId!);
  if (!project) return res.status(404).json({ error: "NOT_FOUND" });
  if (!allowed) return res.status(403).json({ error: "FORBIDDEN" });

  const parsed = createRuleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const rule = await createRule(req.params.projectId, parsed.data);
  res.status(201).json(rule);
});

export const ruleRouter = Router();
ruleRouter.use(requireAuth);

ruleRouter.get("/:id/versions", async (req: AuthenticatedRequest, res) => {
  const rule = await getRuleById(req.params.id);
  if (!rule) return res.status(404).json({ error: "NOT_FOUND" });

  const { allowed } = await assertProjectAccess(rule.projectId, req.userId!);
  if (!allowed) return res.status(403).json({ error: "FORBIDDEN" });

  const versions = await listRuleVersions(req.params.id);
  res.json(versions);
});

const ruleVersionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  scope: z.string().optional(),
});

ruleRouter.put("/:id", async (req: AuthenticatedRequest, res) => {
  const rule = await getRuleById(req.params.id);
  if (!rule) return res.status(404).json({ error: "NOT_FOUND" });

  const { allowed } = await assertProjectAccess(rule.projectId, req.userId!);
  if (!allowed) return res.status(403).json({ error: "FORBIDDEN" });

  const parsed = ruleVersionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const version = await createRuleVersion(req.params.id, parsed.data);
  res.status(201).json(version);
});
