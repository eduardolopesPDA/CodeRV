import { useRef, type ReactNode } from "react";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/Spinner";

const MONACO_LANGUAGE_MAP: Record<string, string> = {
  javascript: "javascript",
  jsx: "javascript",
  typescript: "typescript",
  tsx: "typescript",
  python: "python",
  java: "java",
  go: "go",
  rust: "rust",
  php: "php",
  csharp: "csharp",
  json: "json",
  html: "html",
  css: "css",
  sql: "sql",
  shell: "shell",
  bash: "shell",
};

export function monacoLanguageFor(language: string): string {
  return MONACO_LANGUAGE_MAP[language.toLowerCase()] ?? "plaintext";
}

const defineTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("coderv", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6B7280", fontStyle: "italic" },
      { token: "keyword", foreground: "FFAB4D" },
      { token: "string", foreground: "3DDC97" },
      { token: "number", foreground: "FFC680" },
      { token: "type", foreground: "3FC1E9" },
      { token: "delimiter", foreground: "9AA0AF" },
    ],
    colors: {
      "editor.background": "#0B0C10",
      "editor.foreground": "#E1E3E8",
      "editorLineNumber.foreground": "#3A4049",
      "editorLineNumber.activeForeground": "#9AA0AF",
      "editorCursor.foreground": "#FF8000",
      "editor.selectionBackground": "#FF800033",
      "editor.inactiveSelectionBackground": "#FF800018",
      "editor.lineHighlightBackground": "#0F1116",
      "editor.lineHighlightBorder": "#00000000",
      "editorGutter.background": "#0B0C10",
      "editorIndentGuide.background1": "#1B1E25",
      "editorIndentGuide.activeBackground1": "#2E323C",
      "editorWidget.background": "#161920",
      "editorWidget.border": "#2E323C",
      "input.background": "#0F1116",
      "input.border": "#2E323C",
      "focusBorder": "#FF8000",
      "scrollbarSlider.background": "#2E323C80",
      "scrollbarSlider.hoverBackground": "#2E323CB0",
    },
  });
};

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  height?: string;
  toolbar?: ReactNode;
  className?: string;
}

export function CodeEditor({
  language,
  value,
  onChange,
  height = "420px",
  toolbar,
  className,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      /* sem ação de save — evita o "save" nativo do browser em alguns casos */
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-hidden rounded-card border border-line bg-carbon-900",
        className,
      )}
    >
      {toolbar ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface/60 px-3 py-2">
          {toolbar}
        </div>
      ) : null}
      <Editor
        height={height}
        language={monacoLanguageFor(language)}
        value={value}
        theme="coderv"
        beforeMount={defineTheme}
        onMount={handleMount}
        onChange={(next) => onChange(next ?? "")}
        loading={
          <div className="flex h-full w-full items-center justify-center bg-carbon-900">
            <Spinner className="text-papaya-500" />
          </div>
        }
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineHeight: 21,
          fontFamily:
            "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
          fontLigatures: false,
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          renderLineHighlight: "all",
          bracketPairColorization: { enabled: true },
          guides: { indentation: true },
          tabSize: 2,
          wordWrap: "off",
          overviewRulerLanes: 0,
          folding: true,
          lineNumbersMinChars: 3,
        }}
      />
    </div>
  );
}
