import { prisma } from "../../infra/prisma/client";
import { runAiAnalysis, LlmCaller } from "./ai/ai-analyzer";
import { getAnalyzerForLanguage } from "./analyzers";
import type { StaticFinding } from "./analyzers/analyzer.interface";
import { isBlockingFinding } from "./blocking";
import { resolveApplicableRules } from "./rules-resolver";
import { filterDuplicateAiFindings, sanitizeAiFinding } from "./sanitize-ai-finding";

export interface CreateAnalysisInput {
  code: string;
  language: string;
  depth: "RAPIDA" | "PADRAO" | "DETALHADA";
  categories: string[];
  filePath?: string;
}

export async function createAnalysis(
  projectId: string,
  input: CreateAnalysisInput,
  callLLM?: LlmCaller
) {
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });

  const analyzer = getAnalyzerForLanguage(input.language);
  let staticFindings: StaticFinding[] = [];
  if (analyzer) {
    try {
      staticFindings = await analyzer.analyze(input.code);
    } catch (err) {
      console.error(
        `Analisador estático para "${input.language}" falhou, prosseguindo sem findings estáticos:`,
        err
      );
      staticFindings = [];
    }
  }

  const resolvedRules = await resolveApplicableRules(projectId, input.filePath);
  const contextEntries = await prisma.contextEntry.findMany({ where: { projectId } });

  const aiFindings = await runAiAnalysis(
    {
      code: input.code,
      language: input.language,
      depth: input.depth,
      categories: input.categories,
      project: {
        name: project.name,
        description: project.description,
        objective: project.objective,
        technologies: project.technologies,
        architecture: project.architecture,
        conventions: project.conventions,
        additionalInfo: project.additionalInfo,
      },
      rules: resolvedRules,
      contextEntries: contextEntries.map((entry) => ({ content: entry.content })),
      staticFindings,
    },
    callLLM
  );

  const staticFindingsData = staticFindings.map((finding) => ({
    category: finding.category,
    classification: "tecnico",
    location: finding.location,
    description: finding.description,
    evidence: finding.evidence,
    severity: finding.severity,
    confidence: 100,
    suggestion: null,
    source: "STATIC_ANALYSIS" as const,
    metadata: { ruleId: finding.ruleId },
    isBlocking: false,
    clarificationQuestion: undefined as string | undefined,
  }));

  const validRuleIdentifiers = new Set(resolvedRules.map((rule) => rule.identifier));
  const sanitizedAiFindings = aiFindings.map((finding) =>
    sanitizeAiFinding(finding, validRuleIdentifiers)
  );
  const dedupedAiFindings = filterDuplicateAiFindings(sanitizedAiFindings, staticFindings);

  const aiFindingsData = dedupedAiFindings.map((finding) => ({
    category: finding.category,
    classification: finding.classification,
    location: finding.location,
    description: finding.description,
    evidence: finding.evidence,
    severity: finding.severity,
    confidence: finding.confidence,
    suggestion: finding.suggestion ?? null,
    source: "AI" as const,
    metadata: finding.ruleIdentifier ? { ruleIdentifier: finding.ruleIdentifier } : undefined,
    isBlocking: isBlockingFinding(finding.severity, finding.needsClarification),
    clarificationQuestion: finding.needsClarification ? finding.clarificationQuestion : undefined,
  }));

  const analysis = await prisma.analysis.create({
    data: {
      projectId,
      code: input.code,
      language: input.language,
      depth: input.depth,
      categories: input.categories,
      ruleVersionsUsed: {
        create: resolvedRules.map((rule) => ({ ruleVersionId: rule.ruleVersionId })),
      },
      findings: {
        create: [...staticFindingsData, ...aiFindingsData].map(({ clarificationQuestion, ...rest }) => ({
          ...rest,
          clarifications: clarificationQuestion
            ? { create: [{ question: clarificationQuestion }] }
            : undefined,
        })),
      },
    },
    include: { findings: { include: { clarifications: true } } },
  });

  return withCategoriesWithNoFindings(analysis);
}

function withCategoriesWithNoFindings<
  T extends { categories: string[]; findings: { category: string }[] }
>(analysis: T) {
  const categoriesWithFindings = new Set(analysis.findings.map((finding) => finding.category));
  const categoriesWithNoFindings = analysis.categories.filter(
    (category) => !categoriesWithFindings.has(category)
  );
  return { ...analysis, categoriesWithNoFindings };
}

export async function getAnalysisById(analysisId: string) {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: { findings: { include: { clarifications: true } } },
  });
  if (!analysis) return null;
  return withCategoriesWithNoFindings(analysis);
}

export async function getAnalysisWithProject(analysisId: string) {
  return prisma.analysis.findUnique({
    where: { id: analysisId },
    include: { project: true },
  });
}
