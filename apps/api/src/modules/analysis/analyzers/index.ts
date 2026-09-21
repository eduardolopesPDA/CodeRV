import type { Analyzer } from "./analyzer.interface";
import { EslintAnalyzer } from "./eslint.analyzer";
import { RuffAnalyzer } from "./ruff.analyzer";

const analyzers: Analyzer[] = [new EslintAnalyzer(), new RuffAnalyzer()];

export function getAnalyzerForLanguage(language: string): Analyzer | undefined {
  return analyzers.find((analyzer) => analyzer.language === language);
}
