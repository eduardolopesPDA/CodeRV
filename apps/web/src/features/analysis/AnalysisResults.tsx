import { useState } from "react";
import type { AnalysisDTO, FindingDTO } from "@code-reviewer/shared";
import Button from "../../components/Button";
import Card from "../../components/Card";
import * as analysisApi from "../../lib/api-client/analysis";

const CATEGORY_LABELS: Record<string, string> = {
  bugs: "Bugs",
  seguranca: "Segurança",
  performance: "Performance",
  legibilidade: "Legibilidade",
  boas_praticas: "Boas práticas",
};

const SEVERITY_COLOR: Record<string, string> = {
  ALTA: "bg-red-100 text-red-700 border-red-300",
  MEDIA: "bg-amber-100 text-amber-700 border-amber-300",
  BAIXA: "bg-carbon-100 text-carbon-600 border-carbon-300",
};

const SEVERITY_DESCRIPTIONS: Record<string, string> = {
  ALTA: "Alta: problema significativo — pode causar falhas, riscos de segurança ou violar uma regra crítica do projeto. Merece atenção prioritária.",
  MEDIA: "Média: problema relevante que vale corrigir, mas não é crítico nem bloqueante.",
  BAIXA: "Baixa: observação menor, de estilo ou boas práticas, sem impacto direto no funcionamento do código.",
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  tecnico: "Técnico",
  regra_negocio: "Regra de negócio",
  estilo: "Estilo",
  sugestao: "Sugestão",
};

const CLASSIFICATION_DESCRIPTIONS: Record<string, string> = {
  tecnico: "Técnico: achado sobre o código em si (ex.: bug, performance), identificado por análise estática ou pela IA.",
  regra_negocio: "Regra de negócio: o código contraria uma regra de negócio cadastrada neste projeto.",
  estilo: "Estilo: questão de estilo ou convenção de código, sem afetar o funcionamento.",
  sugestao: "Sugestão: recomendação de melhoria da IA — não necessariamente um problema.",
};

const CONFIDENCE_DESCRIPTION =
  "Nível de confiança da IA nessa conclusão, de 0 a 100%. Quanto mais alto, mais certeza a IA tem de que o achado é real.";

const SOURCE_DESCRIPTION =
  "De onde veio esse achado: ferramenta de análise estática (ESLint/Ruff) ou avaliação da IA.";

export default function AnalysisResults({
  analysis,
  onAnalysisUpdated,
}: {
  analysis: AnalysisDTO;
  onAnalysisUpdated: (analysis: AnalysisDTO) => void;
}) {
  async function refresh() {
    onAnalysisUpdated(await analysisApi.getAnalysis(analysis.id));
  }

  return (
    <div className="space-y-4">
      <Card as="details" className="text-sm !p-3">
        <summary className="text-carbon-600 cursor-pointer font-medium">
          O que significam esses rótulos?
        </summary>
        <div className="mt-3 space-y-3 text-carbon-600">
          <div>
            <p className="font-medium text-carbon-700 mb-1">Severidade</p>
            <ul className="space-y-1">
              {Object.entries(SEVERITY_DESCRIPTIONS).map(([key, desc]) => (
                <li key={key} className="flex gap-2">
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full border text-xs h-fit ${SEVERITY_COLOR[key]}`}
                  >
                    {key}
                  </span>
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-carbon-700 mb-1">Classificação</p>
            <ul className="space-y-1">
              {Object.entries(CLASSIFICATION_DESCRIPTIONS).map(([key, desc]) => (
                <li key={key} className="flex gap-2">
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-carbon-100 text-xs h-fit">
                    {CLASSIFICATION_LABELS[key]}
                  </span>
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
          </div>
          <p>
            <span className="font-medium text-carbon-700">Confiança:</span> {CONFIDENCE_DESCRIPTION}
          </p>
          <p>
            <span className="font-medium text-carbon-700">Origem:</span> {SOURCE_DESCRIPTION}
          </p>
        </div>
      </Card>

      {analysis.categoriesWithNoFindings.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl p-3">
          Categorias analisadas sem nenhum problema encontrado:{" "}
          {analysis.categoriesWithNoFindings.map((c) => CATEGORY_LABELS[c] ?? c).join(", ")}.
        </div>
      )}

      <ul className="space-y-3">
        {analysis.findings.map((finding) => (
          <FindingCard key={finding.id} analysisId={analysis.id} finding={finding} onUpdated={refresh} />
        ))}
        {analysis.findings.length === 0 && (
          <p className="text-sm text-carbon-300">Nenhuma ocorrência encontrada em nenhuma categoria.</p>
        )}
      </ul>
    </div>
  );
}

function FindingCard({
  analysisId,
  finding,
  onUpdated,
}: {
  analysisId: string;
  finding: FindingDTO;
  onUpdated: () => void;
}) {
  const [answer, setAnswer] = useState("");
  const [applyToContext, setApplyToContext] = useState(false);
  const [disputeMessage, setDisputeMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const pendingClarification = finding.clarifications.find((c) => !c.answeredAt);

  async function handleClarify() {
    if (!answer.trim()) return;
    setBusy(true);
    setActionError(null);
    try {
      await analysisApi.clarifyFinding(analysisId, finding.id, answer, applyToContext);
      setAnswer("");
      onUpdated();
    } catch (err) {
      setActionError(
        analysisApi.getAiErrorMessage(err) ?? "Não foi possível enviar a resposta. Tente novamente."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDispute() {
    if (!disputeMessage.trim()) return;
    setBusy(true);
    setActionError(null);
    try {
      await analysisApi.disputeFinding(analysisId, finding.id, disputeMessage);
      setDisputeMessage("");
      onUpdated();
    } catch (err) {
      setActionError(
        analysisApi.getAiErrorMessage(err) ?? "Não foi possível enviar a contestação. Tente novamente."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card as="li" className={`space-y-2 ${finding.isBlocking ? "border-red-300" : ""}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="px-2 py-0.5 rounded-full bg-carbon-100 text-carbon-600">
          {CATEGORY_LABELS[finding.category] ?? finding.category}
        </span>
        <span
          className="px-2 py-0.5 rounded-full bg-carbon-100 text-carbon-600"
          title={CLASSIFICATION_DESCRIPTIONS[finding.classification]}
        >
          {CLASSIFICATION_LABELS[finding.classification] ?? finding.classification}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full border ${SEVERITY_COLOR[finding.severity]}`}
          title={SEVERITY_DESCRIPTIONS[finding.severity]}
        >
          {finding.severity}
        </span>
        <span className="text-carbon-400" title={CONFIDENCE_DESCRIPTION}>
          confiança: {finding.confidence}%
        </span>
        <span className="text-carbon-400" title={SOURCE_DESCRIPTION}>
          origem: {finding.source === "AI" ? "IA" : "análise estática"}
        </span>
        {finding.isBlocking && (
          <span
            className="px-2 py-0.5 rounded-full bg-red-600 text-white"
            title="Achado de alta severidade com uma dúvida em aberto — a IA precisa da sua resposta antes de confirmar a conclusão."
          >
            aguardando esclarecimento
          </span>
        )}
      </div>

      <p className="text-sm text-carbon-800 font-semibold mt-2">{finding.location}</p>
      <p className="text-sm text-carbon-700">{finding.description}</p>
      <p className="text-xs text-carbon-500 mt-1">Evidência: {finding.evidence}</p>
      {finding.suggestion && <p className="text-xs text-carbon-500">Sugestão: {finding.suggestion}</p>}
      {actionError && <p className="text-xs text-red-600 mt-1">{actionError}</p>}

      {pendingClarification && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2 text-sm mt-3">
          <p className="text-amber-800 font-medium">{pendingClarification.question}</p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={2}
            className="w-full border border-carbon-200 rounded-xl px-2 py-1.5 text-sm text-carbon-900 focus:outline-none focus:ring-2 focus:ring-papaya-400"
            placeholder="Sua resposta..."
          />
          <label className="flex items-center gap-1.5 text-xs text-carbon-600">
            <input
              type="checkbox"
              checked={applyToContext}
              onChange={(e) => setApplyToContext(e.target.checked)}
              className="accent-papaya-500"
            />
            Adicionar esta resposta ao contexto permanente do projeto
          </label>
          <Button size="sm" onClick={handleClarify} disabled={busy}>
            Responder
          </Button>
        </div>
      )}

      {!pendingClarification && (
        <details className="text-sm mt-3">
          <summary className="text-carbon-500 cursor-pointer hover:text-papaya-600">
            Contestar esta conclusão
          </summary>
          <div className="mt-2 space-y-2">
            <textarea
              value={disputeMessage}
              onChange={(e) => setDisputeMessage(e.target.value)}
              rows={2}
              className="w-full border border-carbon-200 rounded-xl px-2 py-1.5 text-sm text-carbon-900 focus:outline-none focus:ring-2 focus:ring-papaya-400"
              placeholder="Explique por que discorda..."
            />
            <Button size="sm" variant="ghost" onClick={handleDispute} disabled={busy}>
              Enviar contestação
            </Button>
          </div>
        </details>
      )}
    </Card>
  );
}
