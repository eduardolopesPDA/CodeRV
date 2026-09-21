import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { ProjectDTO } from "@code-reviewer/shared";
import ProjectAnalysisTab from "../analysis/ProjectAnalysisTab";
import ProjectRulesTab from "../rules/ProjectRulesTab";
import * as projectsApi from "../../lib/api-client/projects";
import ProjectContextTab from "./ProjectContextTab";

type Tab = "analysis" | "context" | "rules";

const TABS: { key: Tab; label: string }[] = [
  { key: "analysis", label: "Análise" },
  { key: "context", label: "Contexto" },
  { key: "rules", label: "Regras de negócio" },
];

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("analysis");

  useEffect(() => {
    if (!projectId) return;
    setProject(null);
    setError(null);
    projectsApi
      .getProject(projectId)
      .then(setProject)
      .catch(() => setError("Não foi possível carregar o projeto."));
  }, [projectId]);

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!project || !projectId) return <p className="text-carbon-300">Carregando...</p>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">{project.name}</h1>
        {project.description && <p className="text-sm text-carbon-300 mt-0.5">{project.description}</p>}
      </div>

      <div className="border-b border-carbon-700 flex gap-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-papaya-500 text-white"
                : "border-transparent text-carbon-400 hover:text-carbon-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "context" && (
        <ProjectContextTab key={project.id} project={project} onProjectUpdated={setProject} />
      )}
      {tab === "rules" && <ProjectRulesTab key={project.id} projectId={project.id} />}
      {tab === "analysis" && <ProjectAnalysisTab key={project.id} project={project} />}
    </div>
  );
}
