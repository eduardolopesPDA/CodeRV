import { useEffect, useState } from "react";
import type { AnalysisDTO, ProjectDTO } from "@code-reviewer/shared";
import Button from "../../components/Button";
import Card from "../../components/Card";
import * as analysisApi from "../../lib/api-client/analysis";
import CodeEditor from "../editor/CodeEditor";
import AnalysisResults from "./AnalysisResults";

const selectClass =
  "border border-carbon-200 rounded-xl px-3 py-2 text-sm text-carbon-900 focus:outline-none focus:ring-2 focus:ring-papaya-400 focus:border-papaya-400";

const CATEGORY_OPTIONS = [
  { value: "bugs", label: "Bugs" },
  { value: "seguranca", label: "Segurança" },
  { value: "performance", label: "Performance" },
  { value: "legibilidade", label: "Legibilidade" },
  { value: "boas_praticas", label: "Boas práticas" },
];

export default function ProjectAnalysisTab({ project }: { project: ProjectDTO }) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(project.supportedLanguages[0] ?? "");
  const [depth, setDepth] = useState<"RAPIDA" | "PADRAO" | "DETALHADA">("PADRAO");
  const [categories, setCategories] = useState<string[]>(CATEGORY_OPTIONS.map((c) => c.value));
  const [analysis, setAnalysis] = useState<AnalysisDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!project.supportedLanguages.includes(language)) {
      setLanguage(project.supportedLanguages[0] ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.supportedLanguages]);

  function toggleCategory(value: string) {
    setCategories((prev) => (prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]));
  }

  async function handleAnalyze() {
    if (!code.trim() || categories.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analysisApi.createAnalysis(project.id, { code, language, depth, categories });
      setAnalysis(result);
    } catch (err) {
      setError(analysisApi.getAiErrorMessage(err) ?? "Não foi possível concluir a análise.");
    } finally {
      setLoading(false);
    }
  }

  if (project.supportedLanguages.length === 0) {
    return (
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
        Configure ao menos uma linguagem suportada na aba "Contexto" antes de rodar uma análise.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm text-carbon-600 mb-1">Linguagem</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={selectClass}>
            {project.supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-carbon-600 mb-1">Profundidade</label>
          <select
            value={depth}
            onChange={(e) => setDepth(e.target.value as typeof depth)}
            className={selectClass}
          >
            <option value="RAPIDA">Rápida</option>
            <option value="PADRAO">Padrão</option>
            <option value="DETALHADA">Detalhada</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-3">
          {CATEGORY_OPTIONS.map((cat) => (
            <label key={cat.value} className="flex items-center gap-1.5 text-sm text-carbon-600">
              <input
                type="checkbox"
                checked={categories.includes(cat.value)}
                onChange={() => toggleCategory(cat.value)}
                className="accent-papaya-500"
              />
              {cat.label}
            </label>
          ))}
        </div>
        <Button onClick={handleAnalyze} disabled={loading} className="ml-auto">
          {loading ? "Analisando..." : "Analisar código"}
        </Button>
      </Card>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <CodeEditor language={language} value={code} onChange={setCode} />

      {analysis && <AnalysisResults analysis={analysis} onAnalysisUpdated={setAnalysis} />}
    </div>
  );
}
