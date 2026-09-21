import { prisma } from "../../../infra/prisma/client";
import { LlmCaller, ReevaluationSourceFinding, reevaluateFinding } from "../ai/ai-analyzer";
import { isBlockingFinding } from "../blocking";
import { sanitizeAiFinding } from "../sanitize-ai-finding";

export class NoPendingClarificationError extends Error {}
export class FindingNotInAnalysisError extends Error {}

function toSourceFinding(finding: {
  category: string;
  classification: string;
  location: string;
  description: string;
  evidence: string;
  severity: string;
  confidence: number;
  suggestion: string | null;
}): ReevaluationSourceFinding {
  return {
    category: finding.category,
    classification: finding.classification,
    location: finding.location,
    description: finding.description,
    evidence: finding.evidence,
    severity: finding.severity,
    confidence: finding.confidence,
    suggestion: finding.suggestion,
  };
}

export async function getFindingWithContext(findingId: string) {
  return prisma.finding.findUnique({
    where: { id: findingId },
    include: {
      analysis: {
        include: {
          ruleVersionsUsed: { include: { ruleVersion: { include: { rule: true } } } },
        },
      },
      clarifications: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

function validRuleIdentifiersFor(finding: Awaited<ReturnType<typeof getFindingWithContext>>): Set<string> {
  const identifiers = finding?.analysis.ruleVersionsUsed.map((link) => link.ruleVersion.rule.identifier) ?? [];
  return new Set(identifiers);
}

export async function clarifyFinding(
  analysisId: string,
  findingId: string,
  answer: string,
  applyToContext: boolean,
  callLLM?: LlmCaller
) {
  const finding = await getFindingWithContext(findingId);
  if (!finding) throw new Error("FINDING_NOT_FOUND");
  if (finding.analysisId !== analysisId) throw new FindingNotInAnalysisError();

  const pendingClarification = finding.clarifications[0];
  if (!pendingClarification || pendingClarification.answeredAt) {
    throw new NoPendingClarificationError();
  }

  const rawUpdated = await reevaluateFinding(
    toSourceFinding(finding),
    finding.analysis.code,
    answer,
    callLLM
  );
  const updated = sanitizeAiFinding(rawUpdated, validRuleIdentifiersFor(finding));

  await prisma.clarification.update({
    where: { id: pendingClarification.id },
    data: { answer, answeredAt: new Date(), appliedToContext: applyToContext },
  });

  const updatedFinding = await prisma.finding.update({
    where: { id: findingId },
    data: {
      description: updated.description,
      evidence: updated.evidence,
      severity: updated.severity,
      confidence: updated.confidence,
      suggestion: updated.suggestion ?? null,
      classification: updated.classification,
      isBlocking: isBlockingFinding(updated.severity, updated.needsClarification),
    },
    include: { clarifications: true },
  });

  if (applyToContext) {
    await prisma.contextEntry.create({
      data: {
        projectId: finding.analysis.projectId,
        content: answer,
        sourceFindingId: findingId,
      },
    });
  }

  return updatedFinding;
}

export async function disputeFinding(
  analysisId: string,
  findingId: string,
  message: string,
  callLLM?: LlmCaller
) {
  const finding = await getFindingWithContext(findingId);
  if (!finding) throw new Error("FINDING_NOT_FOUND");
  if (finding.analysisId !== analysisId) throw new FindingNotInAnalysisError();

  const rawUpdated = await reevaluateFinding(
    toSourceFinding(finding),
    finding.analysis.code,
    message,
    callLLM
  );
  const updated = sanitizeAiFinding(rawUpdated, validRuleIdentifiersFor(finding));

  return prisma.finding.update({
    where: { id: findingId },
    data: {
      description: updated.description,
      evidence: updated.evidence,
      severity: updated.severity,
      confidence: updated.confidence,
      suggestion: updated.suggestion ?? null,
      classification: updated.classification,
      isBlocking: isBlockingFinding(updated.severity, updated.needsClarification),
    },
    include: { clarifications: true },
  });
}
