import { Play, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Surface } from "@/components/ui/Surface";
import { Alert } from "@/components/ui/States";
import { formatChars } from "@/lib/format";
import {
  ANALYSIS_CATEGORIES,
  DEPTHS,
  type AnalysisCategory,
  type Depth,
  type Project,
} from "@/lib/api/types";
import {
  CATEGORY_HINTS,
  CATEGORY_LABELS,
  DEPTH_DESCRIPTIONS,
  DEPTH_LABELS,
  languageLabel,
} from "@/lib/labels";

export const MAX_CODE_LENGTH = 50_000;

interface AnalysisConfigPanelProps {
  project: Project;
  language: string;
  onLanguageChange: (value: string) => void;
  depth: Depth;
  onDepthChange: (value: Depth) => void;
  categories: AnalysisCategory[];
  onCategoriesChange: (value: AnalysisCategory[]) => void;
  filePath: string;
  onFilePathChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  codeLength: number;
}

export function AnalysisConfigPanel({
  project,
  language,
  onLanguageChange,
  depth,
  onDepthChange,
  categories,
  onCategoriesChange,
  filePath,
  onFilePathChange,
  onAnalyze,
  isAnalyzing,
  codeLength,
}: AnalysisConfigPanelProps) {
  const overLimit = codeLength > MAX_CODE_LENGTH;
  const noLanguage = project.supportedLanguages.length === 0;
  const blocked = noLanguage || overLimit || codeLength === 0 || isAnalyzing;

  function toggleCategory(category: AnalysisCategory) {
    onCategoriesChange(
      categories.includes(category)
        ? categories.filter((item) => item !== category)
        : [...categories, category],
    );
  }

  return (
    <Surface className="space-y-5 p-5">
      <div>
        <h2 className="text-[13px] font-semibold text-ink">
          Configuração da análise
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-subtle">
          O contexto do projeto e as regras ativas entram automaticamente.
        </p>
      </div>

      {noLanguage ? (
        <Alert tone="warning" title="Sem linguagem configurada">
          Adicione ao menos uma linguagem suportada na aba{" "}
          <strong>Contexto</strong> antes de analisar.
        </Alert>
      ) : (
        <Field label="Linguagem">
          {({ id }) => (
            <Select
              id={id}
              value={language}
              onChange={(event) => onLanguageChange(event.target.value)}
            >
              {project.supportedLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {languageLabel(lang)}
                </option>
              ))}
            </Select>
          )}
        </Field>
      )}

      <div className="space-y-2">
        <p className="text-[13px] font-medium text-muted">Profundidade</p>
        <SegmentedControl<Depth>
          ariaLabel="Profundidade da análise"
          value={depth}
          onChange={onDepthChange}
          options={DEPTHS.map((item) => ({
            value: item,
            label: DEPTH_LABELS[item],
            title: DEPTH_DESCRIPTIONS[item],
          }))}
        />
        <p className="text-[11px] leading-relaxed text-subtle">
          {DEPTH_DESCRIPTIONS[depth]}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-[13px] font-medium text-muted">Categorias</p>
        {ANALYSIS_CATEGORIES.map((category) => (
          <Checkbox
            key={category}
            label={CATEGORY_LABELS[category]}
            description={CATEGORY_HINTS[category]}
            checked={categories.includes(category)}
            onChange={() => toggleCategory(category)}
          />
        ))}
      </div>

      <Field
        label="Caminho do arquivo"
        hint="Ativa regras com escopo por glob (ex.: src/payments/**)."
      >
        {({ id }) => (
          <Input
            id={id}
            value={filePath}
            onChange={(event) => onFilePathChange(event.target.value)}
            placeholder="src/services/charge.ts"
            className="font-mono text-xs"
          />
        )}
      </Field>

      <div className="space-y-3 border-t border-line pt-4">
        <p className="flex items-start gap-2 text-[11px] leading-relaxed text-subtle">
          <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-papaya-400" />
          Análises com IA compartilham um limite de 15 chamadas a cada 15
          minutos — incluindo respostas e contestações.
        </p>

        {overLimit ? (
          <p className="text-[11px] font-medium text-sev-alta">
            Código acima do limite de {formatChars(MAX_CODE_LENGTH)}.
          </p>
        ) : (
          <p className="font-mono text-[11px] text-subtle">
            {formatChars(codeLength)} · limite {formatChars(MAX_CODE_LENGTH)}
          </p>
        )}

        <Button
          size="lg"
          className="w-full"
          loading={isAnalyzing}
          disabled={blocked}
          onClick={onAnalyze}
        >
          {!isAnalyzing ? <Play className="h-4 w-4" /> : null}
          {isAnalyzing ? "Analisando..." : "Analisar código"}
        </Button>
      </div>
    </Surface>
  );
}
