import type { AiFinding } from "./ai/schema";
import type { StaticFinding } from "./analyzers/analyzer.interface";

export function sanitizeAiFinding(finding: AiFinding, validRuleIdentifiers: Set<string>): AiFinding {
  if (finding.classification !== "regra_negocio") return finding;
  if (finding.ruleIdentifier && validRuleIdentifiers.has(finding.ruleIdentifier)) return finding;

  console.warn(
    `IA classificou um achado como "regra_negocio" referenciando um identificador de regra inexistente ` +
      `("${finding.ruleIdentifier ?? "nenhum"}"); reclassificando como sugestão para não fabricar uma regra do projeto.`
  );

  return { ...finding, classification: "sugestao", ruleIdentifier: undefined };
}

function extractLineNumber(location: string): number | null {
  const match = location.match(/(?:linha|line)s?\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}

const NON_BUSINESS_CLASSIFICATIONS = new Set(["tecnico", "estilo"]);

// O modelo às vezes ignora a instrução de não duplicar achados da análise
// estática (observado de forma inconsistente entre chamadas). Como isso não
// pode ser garantido só por prompt, filtramos de forma determinística aqui:
// um achado de IA técnico/de estilo na mesma linha de um achado estático
// quase sempre é o mesmo problema relatado duas vezes.
export function filterDuplicateAiFindings(
  aiFindings: AiFinding[],
  staticFindings: StaticFinding[]
): AiFinding[] {
  const staticLines = new Set(
    staticFindings
      .map((f) => extractLineNumber(f.location))
      .filter((line): line is number => line !== null)
  );

  return aiFindings.filter((finding) => {
    if (!NON_BUSINESS_CLASSIFICATIONS.has(finding.classification)) return true;

    const line = extractLineNumber(finding.location);
    if (line === null || !staticLines.has(line)) return true;

    console.warn(
      `Achado de IA ignorado por parecer duplicata de um achado estático na mesma linha (${finding.location}): "${finding.description}"`
    );
    return false;
  });
}
