import Editor from "@monaco-editor/react";

const MONACO_LANGUAGE_MAP: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
};

export default function CodeEditor({
  language,
  value,
  onChange,
}: {
  language: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="border border-carbon-200 rounded-2xl overflow-hidden shadow-sm">
      <Editor
        height="360px"
        language={MONACO_LANGUAGE_MAP[language] ?? "plaintext"}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        theme="vs-light"
        options={{ minimap: { enabled: false }, fontSize: 13 }}
      />
    </div>
  );
}
