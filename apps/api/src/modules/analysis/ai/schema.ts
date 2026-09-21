import { z } from "zod";

const nullableString = z
  .string()
  .nullable()
  .optional()
  .transform((v) => v ?? undefined);

const nullableBoolean = z
  .boolean()
  .nullable()
  .optional()
  .transform((v) => v ?? undefined);

export const aiFindingSchema = z.object({
  category: z.enum(["bugs", "seguranca", "performance", "legibilidade", "boas_praticas"]),
  classification: z.enum(["tecnico", "regra_negocio", "estilo", "sugestao"]),
  location: z.string(),
  description: z.string(),
  evidence: z.string(),
  severity: z.enum(["BAIXA", "MEDIA", "ALTA"]),
  confidence: z.number().min(0).max(100),
  suggestion: nullableString,
  ruleIdentifier: nullableString,
  needsClarification: nullableBoolean,
  clarificationQuestion: nullableString,
});

export const aiAnalysisResponseSchema = z.object({
  findings: z.array(aiFindingSchema),
});

export type AiFinding = z.infer<typeof aiFindingSchema>;
export type AiAnalysisResponse = z.infer<typeof aiAnalysisResponseSchema>;

// Espelha aiFindingSchema em JSON Schema para o modo "strict" de structured
// outputs do Groq, que exige todo campo opcional presente porém nullable.
export const AI_ANALYSIS_JSON_SCHEMA = {
  name: "code_review_findings",
  strict: true,
  schema: {
    type: "object",
    properties: {
      findings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: ["bugs", "seguranca", "performance", "legibilidade", "boas_praticas"],
            },
            classification: {
              type: "string",
              enum: ["tecnico", "regra_negocio", "estilo", "sugestao"],
            },
            location: { type: "string" },
            description: { type: "string" },
            evidence: { type: "string" },
            severity: { type: "string", enum: ["BAIXA", "MEDIA", "ALTA"] },
            confidence: { type: "integer", minimum: 0, maximum: 100 },
            suggestion: { type: ["string", "null"] },
            ruleIdentifier: { type: ["string", "null"] },
            needsClarification: { type: ["boolean", "null"] },
            clarificationQuestion: { type: ["string", "null"] },
          },
          required: [
            "category",
            "classification",
            "location",
            "description",
            "evidence",
            "severity",
            "confidence",
            "suggestion",
            "ruleIdentifier",
            "needsClarification",
            "clarificationQuestion",
          ],
          additionalProperties: false,
        },
      },
    },
    required: ["findings"],
    additionalProperties: false,
  },
} as const;
