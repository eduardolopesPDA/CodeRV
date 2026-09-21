import { callLLM as defaultCallLLM } from "./llm-client";
import { buildSystemPrompt, buildUserPrompt, BuildUserPromptInput } from "./prompt";
import { aiAnalysisResponseSchema, AiFinding } from "./schema";

export type LlmCaller = (systemPrompt: string, userPrompt: string) => Promise<string>;

function extractJson(raw: string): string {
  const fencedMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return fencedMatch ? fencedMatch[1].trim() : raw.trim();
}

function parseFindings(raw: string): AiFinding[] {
  const json = extractJson(raw);

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(json);
  } catch (err) {
    throw new Error(`Resposta da LLM não é um JSON válido: ${(err as Error).message}`);
  }

  const result = aiAnalysisResponseSchema.safeParse(parsedJson);
  if (!result.success) {
    throw new Error(`Resposta da LLM não corresponde ao formato esperado: ${result.error.message}`);
  }

  return result.data.findings;
}

export async function runAiAnalysis(
  input: BuildUserPromptInput,
  callLLM: LlmCaller = defaultCallLLM
): Promise<AiFinding[]> {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(input);
  const raw = await callLLM(systemPrompt, userPrompt);
  return parseFindings(raw);
}

export interface ReevaluationSourceFinding {
  category: string;
  classification: string;
  location: string;
  description: string;
  evidence: string;
  severity: string;
  confidence: number;
  suggestion?: string | null;
}

export async function reevaluateFinding(
  finding: ReevaluationSourceFinding,
  code: string,
  extraInfo: string,
  callLLM: LlmCaller = defaultCallLLM
): Promise<AiFinding> {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = `Uma ocorrência anterior desta análise precisa ser reavaliada com base em uma nova informação fornecida pelo usuário.

## Ocorrência original
${JSON.stringify(finding, null, 2)}

## Código analisado
\`\`\`
${code}
\`\`\`

## Informação adicional fornecida pelo usuário
${extraInfo}

Responda com a lista "findings" contendo exatamente uma ocorrência: a mesma ocorrência original, atualizada com base na nova informação (severidade, confiança, descrição, evidência, sugestão e classificação podem mudar). Se a nova informação resolver completamente a dúvida, "needsClarification" deve ser false.`;

  const raw = await callLLM(systemPrompt, userPrompt);
  const findings = parseFindings(raw);
  if (findings.length === 0) {
    throw new Error("Reavaliação da IA não retornou nenhuma ocorrência");
  }
  return findings[0];
}
