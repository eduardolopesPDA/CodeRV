import { Response, Router } from "express";
import Groq from "groq-sdk";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { AuthenticatedRequest, requireAuth } from "../auth/auth.middleware";
import { getProjectById, isTeamMember } from "../projects/projects.service";
import { createAnalysis, getAnalysisById, getAnalysisWithProject } from "./analysis.service";
import {
  clarifyFinding,
  disputeFinding,
  FindingNotInAnalysisError,
  NoPendingClarificationError,
} from "./clarification/clarification.service";

async function assertProjectAccess(projectId: string, userId: string) {
  const project = await getProjectById(projectId);
  if (!project) return { project: null, allowed: false };
  const allowed = await isTeamMember(project.teamId, userId);
  return { project, allowed };
}

async function assertAnalysisAccess(analysisId: string, userId: string) {
  const analysis = await getAnalysisWithProject(analysisId);
  if (!analysis) return { analysis: null, allowed: false };
  const allowed = await isTeamMember(analysis.project.teamId, userId);
  return { analysis, allowed };
}

function respondToKnownAiError(err: unknown, res: Response): boolean {
  if (err instanceof Groq.APIConnectionTimeoutError) {
    res.status(504).json({ error: "AI_TIMEOUT" });
    return true;
  }
  if (err instanceof Groq.RateLimitError) {
    res.status(429).json({ error: "AI_PROVIDER_RATE_LIMITED" });
    return true;
  }
  if (err instanceof Error && err.message.includes("LLM_API_KEY")) {
    res.status(503).json({ error: "AI_NOT_CONFIGURED" });
    return true;
  }
  return false;
}

const aiCallRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthenticatedRequest) => req.userId ?? req.ip ?? "anonymous",
  message: { error: "TOO_MANY_AI_REQUESTS" },
});

export const projectAnalysesRouter = Router({ mergeParams: true });
projectAnalysesRouter.use(requireAuth);

const categorySchema = z.enum(["bugs", "seguranca", "performance", "legibilidade", "boas_praticas"]);

const MAX_CODE_LENGTH = 50_000;

const createAnalysisSchema = z.object({
  code: z
    .string()
    .min(1)
    .max(MAX_CODE_LENGTH, `O código não pode ultrapassar ${MAX_CODE_LENGTH} caracteres por análise`),
  language: z.string().min(1),
  depth: z.enum(["RAPIDA", "PADRAO", "DETALHADA"]),
  categories: z.array(categorySchema).min(1),
  filePath: z.string().optional(),
});

projectAnalysesRouter.post("/", aiCallRateLimiter, async (req: AuthenticatedRequest, res) => {
  const { project, allowed } = await assertProjectAccess(req.params.projectId, req.userId!);
  if (!project) return res.status(404).json({ error: "NOT_FOUND" });
  if (!allowed) return res.status(403).json({ error: "FORBIDDEN" });

  const parsed = createAnalysisSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  if (!project.supportedLanguages.includes(parsed.data.language)) {
    return res.status(422).json({ error: "UNSUPPORTED_LANGUAGE" });
  }

  try {
    const analysis = await createAnalysis(req.params.projectId, parsed.data);
    res.status(201).json(analysis);
  } catch (err) {
    if (respondToKnownAiError(err, res)) return;
    throw err;
  }
});

export const analysisRouter = Router();
analysisRouter.use(requireAuth);

analysisRouter.get("/:id", async (req: AuthenticatedRequest, res) => {
  const { analysis, allowed } = await assertAnalysisAccess(req.params.id, req.userId!);
  if (!analysis) return res.status(404).json({ error: "NOT_FOUND" });
  if (!allowed) return res.status(403).json({ error: "FORBIDDEN" });

  const full = await getAnalysisById(req.params.id);
  res.json(full);
});

const clarifySchema = z.object({
  answer: z.string().min(1),
  applyToContext: z.boolean().default(false),
});

analysisRouter.post(
  "/:analysisId/findings/:findingId/clarify",
  aiCallRateLimiter,
  async (req: AuthenticatedRequest, res) => {
    const { analysis, allowed } = await assertAnalysisAccess(req.params.analysisId, req.userId!);
    if (!analysis) return res.status(404).json({ error: "NOT_FOUND" });
    if (!allowed) return res.status(403).json({ error: "FORBIDDEN" });

    const parsed = clarifySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    try {
      const finding = await clarifyFinding(
        req.params.analysisId,
        req.params.findingId,
        parsed.data.answer,
        parsed.data.applyToContext
      );
      res.json(finding);
    } catch (err) {
      if (err instanceof NoPendingClarificationError) {
        return res.status(409).json({ error: "NO_PENDING_CLARIFICATION" });
      }
      if (err instanceof FindingNotInAnalysisError) {
        return res.status(404).json({ error: "NOT_FOUND" });
      }
      if (respondToKnownAiError(err, res)) return;
      throw err;
    }
  }
);

const disputeSchema = z.object({
  message: z.string().min(1),
});

analysisRouter.post(
  "/:analysisId/findings/:findingId/dispute",
  aiCallRateLimiter,
  async (req: AuthenticatedRequest, res) => {
    const { analysis, allowed } = await assertAnalysisAccess(req.params.analysisId, req.userId!);
    if (!analysis) return res.status(404).json({ error: "NOT_FOUND" });
    if (!allowed) return res.status(403).json({ error: "FORBIDDEN" });

    const parsed = disputeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    try {
      const finding = await disputeFinding(
        req.params.analysisId,
        req.params.findingId,
        parsed.data.message
      );
      res.json(finding);
    } catch (err) {
      if (err instanceof FindingNotInAnalysisError) {
        return res.status(404).json({ error: "NOT_FOUND" });
      }
      if (respondToKnownAiError(err, res)) return;
      throw err;
    }
  }
);
