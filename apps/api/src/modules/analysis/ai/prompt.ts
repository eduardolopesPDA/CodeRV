import type { ResolvedRule } from "../rules-resolver";
import type { StaticFinding } from "../analyzers/analyzer.interface";

export interface ProjectContextInput {
  name: string;
  description: string | null;
  objective: string | null;
  technologies: string[];
  architecture: string | null;
  conventions: string | null;
  additionalInfo: string | null;
}

export interface BuildUserPromptInput {
  code: string;
  language: string;
  depth: string;
  categories: string[];
  project: ProjectContextInput;
  rules: ResolvedRule[];
  contextEntries: { content: string }[];
  staticFindings: StaticFinding[];
}

export function buildSystemPrompt(): string {
  return `Você é um revisor de código especialista atuando como parte do sistema "Code Reviewer".

Regras inegociáveis:
- As regras de negócio fornecidas pelo usuário são a fonte de verdade do projeto. Você NÃO PODE reinterpretá-las, alterar seu significado, criar exceções não informadas, criar novas regras por conta própria, ou tratar uma interpretação própria como se fosse uma regra do projeto.
- Você pode comparar o código com as regras e sinalizar dúvida ou contradição entre regra, código e contexto usando "needsClarification" e "clarificationQuestion".
- NUNCA afirme que existe um problema sem evidência suficiente encontrada no próprio código analisado. Toda ocorrência deve conter, em "evidence", o trecho ou comportamento concreto observado no código que sustenta a conclusão.
- Se a severidade for ALTA e faltar uma informação que pode mudar significativamente a conclusão, marque "needsClarification": true e formule uma pergunta objetiva em "clarificationQuestion".
- NUNCA crie um achado seu para um problema que já apareça na lista "Achados da análise estática" do prompt do usuário, mesmo usando categoria, severidade ou texto diferentes. Se um trecho de código já está coberto por um achado estático, ignore-o completamente e foque no que a análise estática não cobre (regras de negócio, lógica, segurança, contexto do projeto).
- "confidence" é um número INTEIRO de 0 a 100 (nunca uma fração de 0.0 a 1.0). Reflita sua certeza real: uma observação sintática óbvia e inequívoca deve ter confidence próximo de 100; uma suspeita especulativa deve ter confidence baixo (ex.: 20-40).

A resposta é validada automaticamente contra um schema JSON fixo (campos "category", "classification", "location", "description", "evidence", "severity", "confidence", "suggestion", "ruleIdentifier", "needsClarification", "clarificationQuestion" dentro de "findings"). Preencha "ruleIdentifier" apenas quando "classification" for "regra_negocio", referenciando exatamente um identificador de regra fornecido no contexto; nos demais casos deixe os campos opcionais como null.`;
}

export function buildUserPrompt(input: BuildUserPromptInput): string {
  const rulesText = input.rules.length
    ? input.rules
        .map(
          (r) =>
            `- [${r.identifier}] ${r.title}: ${r.description}${r.scope ? ` (escopo: ${r.scope})` : ""}`
        )
        .join("\n")
    : "Nenhuma regra de negócio cadastrada para este projeto.";

  const contextText = input.contextEntries.length
    ? input.contextEntries.map((c) => `- ${c.content}`).join("\n")
    : "Nenhuma informação de contexto adicional registrada.";

  const staticFindingsText = input.staticFindings.length
    ? input.staticFindings.map((f) => `- [${f.ruleId}] ${f.description} (${f.location})`).join("\n")
    : "Nenhum achado de análise estática.";

  return `## Contexto do projeto
Nome: ${input.project.name}
Descrição: ${input.project.description ?? "não informado"}
Objetivo: ${input.project.objective ?? "não informado"}
Tecnologias: ${input.project.technologies.join(", ") || "não informado"}
Arquitetura: ${input.project.architecture ?? "não informado"}
Convenções: ${input.project.conventions ?? "não informado"}
Informações adicionais: ${input.project.additionalInfo ?? "não informado"}

## Contexto permanente confirmado
${contextText}

## Regras de negócio (fonte de verdade, não reinterprete)
${rulesText}

## Achados da análise estática (já detectados — NÃO crie achados seus para o mesmo problema)
${staticFindingsText}

## Parâmetros da análise
Linguagem: ${input.language}
Profundidade: ${input.depth}
Categorias solicitadas: ${input.categories.join(", ")}

## Código a ser analisado
\`\`\`${input.language}
${input.code}
\`\`\`

Analise o código acima considerando apenas as categorias solicitadas. Para uma categoria solicitada em que nenhum problema for encontrado, simplesmente não inclua findings dela.`;
}
