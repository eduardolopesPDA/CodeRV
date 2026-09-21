import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ProjectDTO, TeamDTO } from "@code-reviewer/shared";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { useAuth } from "../auth/AuthContext";
import * as projectsApi from "../../lib/api-client/projects";
import * as teamsApi from "../../lib/api-client/teams";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

const inputClass =
  "w-full border border-carbon-200 rounded-xl px-3 py-2.5 text-sm text-carbon-900 focus:outline-none focus:ring-2 focus:ring-papaya-400 focus:border-papaya-400";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [teams, setTeams] = useState<TeamDTO[]>([]);
  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [projectsRes, teamsRes] = await Promise.all([
        projectsApi.listProjects(),
        teamsApi.listTeams(),
      ]);
      setProjects(projectsRes);
      setTeams(teamsRes);
      setTeamId((current) => current || teamsRes[0]?.id || "");
      setError(null);
    } catch {
      setError("Não foi possível carregar seus projetos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !teamId) return;
    await projectsApi.createProject({ teamId, name });
    setName("");
    await load();
  }

  if (loading) return <p className="text-carbon-300">Carregando...</p>;
  if (error) return <p className="text-sm text-red-400">{error}</p>;

  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">
          {greeting()}, {firstName}!
        </h1>
        <p className="text-carbon-300 mt-1">
          {projects.length === 0
            ? "Vamos criar seu primeiro projeto e começar a revisar código."
            : "Pronto para revisar mais um trecho de código?"}
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-carbon-400 uppercase tracking-wide mb-3">
          Meus projetos
        </h2>
        <ul className="space-y-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link to={`/projects/${project.id}`}>
                <Card className="hover:border-papaya-300 hover:shadow-md transition">
                  <span className="font-semibold text-carbon-800">{project.name}</span>
                  {project.description && (
                    <p className="text-sm text-carbon-500 mt-0.5">{project.description}</p>
                  )}
                </Card>
              </Link>
            </li>
          ))}
          {projects.length === 0 && (
            <p className="text-sm text-carbon-300">Nenhum projeto ainda.</p>
          )}
        </ul>
      </div>

      <Card>
        <form onSubmit={handleCreate} className="space-y-3">
          <h2 className="font-semibold text-carbon-800">Novo projeto</h2>
          <div>
            <label className="block text-sm text-carbon-600 mb-1">Time</label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className={inputClass}
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-carbon-600 mb-1">Nome do projeto</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <Button type="submit">Criar projeto</Button>
        </form>
      </Card>
    </div>
  );
}
