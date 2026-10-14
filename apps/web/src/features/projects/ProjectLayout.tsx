import {
  Link,
  NavLink,
  Outlet,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/States";
import { Badge } from "@/components/ui/Badge";
import { queryKeys } from "@/lib/query/keys";
import { projectsApi } from "@/lib/api/projects";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { formatDate } from "@/lib/format";
import { languageLabel } from "@/lib/labels";
import type { Project } from "@/lib/api/types";

export interface ProjectOutletContext {
  project: Project;
}

const TABS = [
  { to: "revisao", label: "Revisão" },
  { to: "regras", label: "Regras" },
  { to: "contexto", label: "Contexto" },
];

export function ProjectLayout() {
  const { projectId = "" } = useParams();

  const projectQuery = useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: ({ signal }) => projectsApi.get(projectId, signal),
    enabled: Boolean(projectId),
  });

  useDocumentTitle(projectQuery.data?.name);

  if (projectQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <div className="space-y-6">
        <ErrorState
          message="Não consegui abrir este projeto. Ele pode não existir mais, ou você não faz parte do time."
          onRetry={() => void projectQuery.refetch()}
        />
        <p className="text-center text-[13px]">
          <Link
            to="/projects"
            className="font-semibold text-papaya-400 hover:text-papaya-300"
          >
            Voltar para os projetos
          </Link>
        </p>
      </div>
    );
  }

  const project = projectQuery.data;

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/projects"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle transition-colors hover:text-muted"
          >
            Projetos
          </Link>
          <span className="text-subtle">/</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-papaya-400">
            {project.name}
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-balance text-[26px] font-bold leading-tight tracking-tight text-ink">
              {project.name}
            </h1>
            {project.description ? (
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">
                {project.description}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap gap-1.5">
            {project.supportedLanguages.length > 0 ? (
              project.supportedLanguages.map((lang) => (
                <span key={lang} className="mono-chip">
                  {languageLabel(lang)}
                </span>
              ))
            ) : (
              <Badge tone="alta">sem linguagens configuradas</Badge>
            )}
          </div>
        </div>

        <p className="text-[11px] text-subtle">
          Criado em {formatDate(project.createdAt)}
        </p>
      </header>

      <nav
        aria-label="Seções do projeto"
        className="flex gap-1 overflow-x-auto border-b border-line"
      >
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                "relative shrink-0 px-4 py-3 text-[13px] font-semibold transition-colors",
                isActive
                  ? "text-ink"
                  : "text-subtle hover:text-muted",
              )
            }
          >
            {({ isActive }) => (
              <>
                {tab.label}
                <span
                  className={cn(
                    "absolute inset-x-2 -bottom-px h-[2px] rounded-full transition-colors",
                    isActive ? "bg-papaya-500" : "bg-transparent",
                  )}
                  aria-hidden
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <Outlet context={{ project } satisfies ProjectOutletContext} />
    </div>
  );
}

export function useProject(): ProjectOutletContext {
  return useOutletContext<ProjectOutletContext>();
}
