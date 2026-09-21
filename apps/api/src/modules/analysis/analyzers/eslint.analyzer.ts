import { Linter } from "eslint";
import type { Analyzer, AnalysisCategory, StaticFinding } from "./analyzer.interface";

const RULES: Record<string, "error" | "warn"> = {
  "no-unused-vars": "warn",
  "no-undef": "error",
  "no-var": "warn",
  "prefer-const": "warn",
  eqeqeq: "warn",
  "no-console": "warn",
  "no-debugger": "error",
  "no-empty": "warn",
  "no-dupe-keys": "error",
  "no-unreachable": "error",
};

const RULE_META_TYPE_TO_CATEGORY: Record<string, AnalysisCategory> = {
  problem: "bugs",
  suggestion: "boas_praticas",
  layout: "legibilidade",
};

export class EslintAnalyzer implements Analyzer {
  language = "javascript";

  private linter = new Linter({ configType: "eslintrc" });

  async analyze(code: string): Promise<StaticFinding[]> {
    const messages = this.linter.verify(code, {
      parserOptions: { ecmaVersion: 2022, sourceType: "module", ecmaFeatures: { jsx: true } },
      env: { es2021: true, node: true, browser: true },
      rules: RULES,
    });

    return messages
      .filter((message) => message.ruleId !== null)
      .map((message) => {
        const ruleId = message.ruleId as string;
        const meta = this.linter.getRules().get(ruleId)?.meta;
        const category = RULE_META_TYPE_TO_CATEGORY[meta?.type ?? "suggestion"];

        return {
          location: `linha ${message.line}, coluna ${message.column}`,
          description: message.message,
          evidence: `Regra ESLint "${ruleId}" na linha ${message.line}.`,
          ruleId,
          category,
          severity: message.severity === 2 ? "ALTA" : "MEDIA",
        };
      });
  }
}
