import { FormEvent, useEffect, useState } from "react";
import type { RuleDTO, RuleVersionDTO } from "@code-reviewer/shared";
import Button from "../../components/Button";
import Card from "../../components/Card";
import * as rulesApi from "../../lib/api-client/rules";

const inputClass =
  "w-full border border-carbon-200 rounded-xl px-3 py-2.5 text-sm text-carbon-900 focus:outline-none focus:ring-2 focus:ring-papaya-400 focus:border-papaya-400";

export default function ProjectRulesTab({ projectId }: { projectId: string }) {
  const [rules, setRules] = useState<RuleDTO[]>([]);
  const [form, setForm] = useState({ identifier: "", title: "", description: "", scope: "" });
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
  const [versions, setVersions] = useState<RuleVersionDTO[]>([]);

  async function load() {
    setRules(await rulesApi.listRules(projectId));
  }

  useEffect(() => {
    load();
  }, [projectId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!form.identifier || !form.title || !form.description) return;
    await rulesApi.createRule(projectId, {
      identifier: form.identifier,
      title: form.title,
      description: form.description,
      scope: form.scope || undefined,
    });
    setForm({ identifier: "", title: "", description: "", scope: "" });
    await load();
  }

  async function toggleVersions(ruleId: string) {
    if (expandedRuleId === ruleId) {
      setExpandedRuleId(null);
      return;
    }
    setVersions(await rulesApi.listRuleVersions(ruleId));
    setExpandedRuleId(ruleId);
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="space-y-3">
        <h2 className="font-semibold text-carbon-800">Regras cadastradas</h2>
        <ul className="space-y-2">
          {rules.map((rule) => (
            <li key={rule.id} className="border border-carbon-100 rounded-xl p-3 text-sm bg-carbon-50">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold text-carbon-800">
                    <span className="text-papaya-600">[{rule.identifier}]</span>{" "}
                    {rule.currentVersion?.title}
                  </p>
                  <p className="text-carbon-600">{rule.currentVersion?.description}</p>
                  {rule.currentVersion?.scope && (
                    <p className="text-xs text-carbon-400 mt-1">escopo: {rule.currentVersion.scope}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleVersions(rule.id)}
                  className="text-xs text-papaya-600 hover:underline shrink-0"
                >
                  histórico
                </button>
              </div>
              {expandedRuleId === rule.id && (
                <ul className="mt-2 border-t border-carbon-200 pt-2 space-y-1">
                  {versions.map((v) => (
                    <li key={v.id} className="text-xs text-carbon-500">
                      v{v.version}: {v.title}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
          {rules.length === 0 && <p className="text-sm text-carbon-500">Nenhuma regra ainda.</p>}
        </ul>
      </Card>

      <Card>
        <form onSubmit={handleCreate} className="space-y-3">
          <h2 className="font-semibold text-carbon-800">Nova regra</h2>
          <div>
            <label className="block text-sm text-carbon-600 mb-1">Identificador</label>
            <input
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              placeholder="RN-001"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm text-carbon-600 mb-1">Título</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm text-carbon-600 mb-1">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm text-carbon-600 mb-1">Escopo (glob, opcional)</label>
            <input
              value={form.scope}
              onChange={(e) => setForm({ ...form, scope: e.target.value })}
              placeholder="src/payments/**"
              className={inputClass}
            />
          </div>
          <Button type="submit">Criar regra</Button>
        </form>
      </Card>
    </div>
  );
}
