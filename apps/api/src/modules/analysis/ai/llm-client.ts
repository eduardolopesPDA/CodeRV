import Groq from "groq-sdk";
import { AI_ANALYSIS_JSON_SCHEMA } from "./schema";

const LLM_TIMEOUT_MS = 60_000;
const MODEL = "openai/gpt-oss-120b";

let client: Groq | null = null;

function getClient(): Groq {
  const apiKey = process.env.LLM_API_KEY ?? process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("LLM_API_KEY (ou GROQ_API_KEY) env var é obrigatória para rodar a análise de IA");
  }
  if (!client) {
    client = new Groq({ apiKey });
  }
  return client;
}

export async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const groq = getClient();
  const completion = await groq.chat.completions.create(
    {
      model: MODEL,
      max_completion_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_schema", json_schema: AI_ANALYSIS_JSON_SCHEMA },
    },
    { timeout: LLM_TIMEOUT_MS }
  );

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Resposta da LLM não contém conteúdo de texto");
  }

  return content;
}
