import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileCode2, Eraser, Sparkles } from "lucide-react";
import { CodeEditor } from "@/components/code/CodeEditor";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { analysisApi } from "@/lib/api/analysis";
import { getApiErrorMessage } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query/keys";
import { formatChars } from "@/lib/format";
import { languageLabel } from "@/lib/labels";
import {
  ANALYSIS_CATEGORIES,
  type AnalysisCategory,
  type Depth,
  type Project,
} from "@/lib/api/types";
import {
  clearDraft,
  lastAnalysisKey,
  pushHistory,
  readDraft,
  readHistory,
  readJson,
  writeDraft,
  writeJson,
  type DraftState,
  type LocalAnalysisEntry,
} from "@/lib/storage";
import { useProject } from "@/features/projects/ProjectLayout";
import { AnalysisConfigPanel } from "./AnalysisConfigPanel";
import { AnalysisResults } from "./AnalysisResults";
import { LocalHistory } from "./LocalHistory";

const EXTENSION_LANGUAGES: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  java: "java",
  go: "go",
  rs: "rust",
  php: "php",
  cs: "csharp",
};

const EXAMPLE_CODE = `// Cole aqui o código que você quer revisar.
// As regras do projeto e o contexto cadastrado entram na análise automaticamente.

function calcularTotal(pedidos) {
  var total = 0;
  for (var i = 0; i <= pedidos.length; i++) {
    total += pedidos[i].valor;
  }
  console.log("total:", total);
  return total;
}
`;

function loadDraft(project: Project): DraftState {
  const saved = readDraft(project.id);
  const language =
    saved?.language && project.supportedLanguages.includes(saved.language)
      ? saved.language
      : (project.supportedLanguages[0] ?? "");

  return {
    code: saved?.code ?? "",
    language,
    depth: (saved?.depth as Depth) ?? "PADRAO",
    categories:
      saved?.categories && saved.categories.length > 0
        ? saved.categories
        : [...ANALYSIS_CATEGORIES],
    filePath: saved?.filePath ?? "",
  };
}

export function AnalysisPage() {
  const { project } = useProject();
  const queryClient = useQueryClient();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState<DraftState>(() => loadDraft(project));
  const [history, setHistory] = useState<LocalAnalysisEntry[]>(() =>
    readHistory(project.id),
  );
  const [analysisId, setAnalysisId] = useState<string | null>(() =>
    readJson<string>(lastAnalysisKey(project.id)),
  );

  function patchDraft(patch: Partial<DraftState>) {
    setDraft((previous) => {
      const next = { ...previous, ...patch };
      writeDraft(project.id, next);
      return next;
    });
  }

  const analysisQuery = useQuery({
    queryKey: queryKeys.analysis(analysisId ?? "none"),
    enabled: Boolean(analysisId),
    queryFn: ({ signal }) => analysisApi.get(analysisId!, signal),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      analysisApi.create(project.id, {
        code: draft.code,
        language: draft.language,
        depth: draft.depth as Depth,
        categories: draft.categories as AnalysisCategory[],
        ...(draft.filePath?.trim() ? { filePath: draft.filePath.trim() } : {}),
      }),
    onSuccess: (analysis) => {
      setAnalysisId(analysis.id);
      writeJson(lastAnalysisKey(project.id), analysis.id);
      setHistory(
        pushHistory(project.id, {
          id: analysis.id,
          createdAt: analysis.createdAt,
          language: analysis.language,
          depth: analysis.depth,
        }),
      );
      queryClient.setQueryData(queryKeys.analysis(analysis.id), analysis);
      const blocking = analysis.findings.filter((f) => f.isBlocking).length;
      toast.success(
        "Análise concluída",
        blocking > 0
          ? `${blocking} ${blocking === 1 ? "achado bloqueia" : "achados bloqueiam"} a revisão — responda as dúvidas.`
          : `${analysis.findings.length} ${analysis.findings.length === 1 ? "achado encontrado" : "achados encontrados"}, sem bloqueios.`,
      );
    },
    onError: (error) =>
      toast.error("Não foi possível analisar", getApiErrorMessage(error)),
  });

  async function handleSelectHistory(id: string) {
    try {
      const analysis = await queryClient.fetchQuery({
        queryKey: queryKeys.analysis(id),
        queryFn: ({ signal }) => analysisApi.get(id, signal),
      });
      setAnalysisId(analysis.id);
      writeJson(lastAnalysisKey(project.id), analysis.id);
    } catch (error) {
      toast.error(
        "Análise indisponível",
        getApiErrorMessage(
          error,
          "Ela existe apenas em outro navegador ou foi removida.",
        ),
      );
      setHistory((prev) => prev.filter((item) => item.id !== id));
    }
  }

  async function handleOpenFile(file: File) {
    try {
      const text = await file.text();
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      const inferred = EXTENSION_LANGUAGES[extension];
      const patch: Partial<DraftState> = {
        code: text,
        filePath: file.name,
      };
      if (
        inferred &&
        project.supportedLanguages.includes(inferred) &&
        inferred !== draft.language
      ) {
        patch.language = inferred;
      }
      patchDraft(patch);
      toast.info("Arquivo carregado", file.name);
    } catch {
      toast.error("Não consegui ler este arquivo", "Tente copiar o conteúdo.");
    }
  }

  const analysis = analysisQuery.data;
  const codeLength = draft.code.length;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-4 lg:sticky lg:top-8">
        <AnalysisConfigPanel
          project={project}
          language={draft.language}
          onLanguageChange={(value) => patchDraft({ language: value })}
          depth={draft.depth as Depth}
          onDepthChange={(value) => patchDraft({ depth: value })}
          categories={draft.categories as AnalysisCategory[]}
          onCategoriesChange={(value) => patchDraft({ categories: value })}
          filePath={draft.filePath ?? ""}
          onFilePathChange={(value) => patchDraft({ filePath: value })}
          onAnalyze={() => createMutation.mutate()}
          isAnalyzing={createMutation.isPending}
          codeLength={codeLength}
        />
        <LocalHistory
          entries={history}
          activeId={analysisId}
          onSelect={(id) => void handleSelectHistory(id)}
        />
      </div>

      <div className="min-w-0 space-y-6">
        {codeLength === 0 ? (
          <div className="flex flex-wrap items-center gap-3 rounded-card border border-dashed border-line px-4 py-3">
            <Sparkles className="h-4 w-4 shrink-0 text-papaya-400" />
            <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-muted">
              Cole o trecho que você quer revisar — ou abra um arquivo do seu
              computador.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => patchDraft({ code: EXAMPLE_CODE })}
            >
              Inserir exemplo
            </Button>
          </div>
        ) : null}

        <CodeEditor
          language={draft.language}
          value={draft.code}
          onChange={(value) => patchDraft({ code: value })}
          height="440px"
          toolbar={
            <>
              <span className="mono-chip">
                {languageLabel(draft.language || "texto")}
              </span>
              {draft.filePath ? (
                <span className="mono-chip max-w-[14rem] truncate">
                  {draft.filePath}
                </span>
              ) : null}
              <span className="ml-auto font-mono text-[11px] text-subtle">
                {formatChars(codeLength)}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileCode2 className="h-3.5 w-3.5" />
                Abrir arquivo
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={codeLength === 0}
                onClick={() => {
                  clearDraft(project.id);
                  setDraft((previous) => ({
                    ...previous,
                    code: "",
                    filePath: "",
                  }));
                }}
              >
                <Eraser className="h-3.5 w-3.5" />
                Limpar
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".js,.jsx,.mjs,.cjs,.ts,.tsx,.py,.java,.go,.rs,.php,.cs,.txt"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleOpenFile(file);
                  event.target.value = "";
                }}
              />
            </>
          }
        />

        {analysisQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : analysisQuery.isError ? (
          <ErrorState
            message="Não consegui recuperar esta análise."
            onRetry={() => void analysisQuery.refetch()}
          />
        ) : analysis ? (
          <AnalysisResults key={analysis.id} analysis={analysis} />
        ) : (
          <div className="rounded-card border border-dashed border-line px-6 py-10 text-center">
            <p className="text-[13px] leading-relaxed text-muted">
              Assim que a análise terminar, os achados aparecem aqui — com
              severidade, confiança, evidência e a chance de contestar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
