import { FormEvent, useEffect, useState } from "react";
import type { ContextEntryDTO, ProjectDTO } from "@code-reviewer/shared";
import Button from "../../components/Button";
import Card from "../../components/Card";
import * as contextApi from "../../lib/api-client/context";
import * as projectsApi from "../../lib/api-client/projects";

interface Props {
  project: ProjectDTO;
  onProjectUpdated: (project: ProjectDTO) => void;
}

const inputClass =
  "w-full border border-carbon-200 rounded-xl px-3 py-2.5 text-sm text-carbon-900 focus:outline-none focus:ring-2 focus:ring-papaya-400 focus:border-papaya-400";

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-carbon-600 mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className={inputClass} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}
    </div>
  );
}

export default function ProjectContextTab({ project, onProjectUpdated }: Props) {
  const [form, setForm] = useState({
    description: project.description ?? "",
    objective: project.objective ?? "",
    technologies: project.technologies.join(", "),
    supportedLanguages: project.supportedLanguages.join(", "),
    architecture: project.architecture ?? "",
    conventions: project.conventions ?? "",
    additionalInfo: project.additionalInfo ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<ContextEntryDTO[]>([]);
  const [newEntry, setNewEntry] = useState("");

  async function loadEntries() {
    setEntries(await contextApi.listContextEntries(project.id));
  }

  useEffect(() => {
    loadEntries();
  }, [project.id]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await projectsApi.updateProject(project.id, {
        description: form.description || undefined,
        objective: form.objective || undefined,
        technologies: splitCsv(form.technologies),
        supportedLanguages: splitCsv(form.supportedLanguages),
        architecture: form.architecture || undefined,
        conventions: form.conventions || undefined,
        additionalInfo: form.additionalInfo || undefined,
      });
      onProjectUpdated(updated);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddEntry(e: FormEvent) {
    e.preventDefault();
    if (!newEntry.trim()) return;
    await contextApi.createContextEntry(project.id, newEntry.trim());
    setNewEntry("");
    await loadEntries();
  }

  async function handleDeleteEntry(id: string) {
    await contextApi.deleteContextEntry(id);
    await loadEntries();
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <form onSubmit={handleSave} className="space-y-3">
          <h2 className="font-semibold text-carbon-800">Contexto do projeto</h2>
          <Field
            label="Descrição"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            textarea
          />
          <Field
            label="Objetivo"
            value={form.objective}
            onChange={(v) => setForm({ ...form, objective: v })}
            textarea
          />
          <Field
            label="Tecnologias (separadas por vírgula)"
            value={form.technologies}
            onChange={(v) => setForm({ ...form, technologies: v })}
          />
          <Field
            label="Linguagens suportadas (separadas por vírgula)"
            value={form.supportedLanguages}
            onChange={(v) => setForm({ ...form, supportedLanguages: v })}
          />
          <Field
            label="Arquitetura"
            value={form.architecture}
            onChange={(v) => setForm({ ...form, architecture: v })}
            textarea
          />
          <Field
            label="Convenções"
            value={form.conventions}
            onChange={(v) => setForm({ ...form, conventions: v })}
            textarea
          />
          <Field
            label="Informações adicionais"
            value={form.additionalInfo}
            onChange={(v) => setForm({ ...form, additionalInfo: v })}
            textarea
          />
          <Button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar contexto"}
          </Button>
        </form>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-semibold text-carbon-800">Contexto permanente confirmado</h2>
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="border border-carbon-100 rounded-xl p-3 text-sm flex justify-between gap-2 bg-carbon-50"
            >
              <span>{entry.content}</span>
              <button
                onClick={() => handleDeleteEntry(entry.id)}
                className="text-red-500 text-xs shrink-0 hover:underline"
              >
                remover
              </button>
            </li>
          ))}
          {entries.length === 0 && <p className="text-sm text-carbon-500">Nenhuma entrada ainda.</p>}
        </ul>
        <form onSubmit={handleAddEntry} className="flex gap-2">
          <input
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="Adicionar informação de contexto..."
            className={inputClass}
          />
          <Button type="submit" className="shrink-0">
            Adicionar
          </Button>
        </form>
      </Card>
    </div>
  );
}
