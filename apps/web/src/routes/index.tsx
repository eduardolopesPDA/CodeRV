import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { ProjectsPage } from "@/features/projects/ProjectsPage";
import { ProjectLayout } from "@/features/projects/ProjectLayout";
import { AnalysisPage } from "@/features/analysis/AnalysisPage";
import { RulesPage } from "@/features/rules/RulesPage";
import { ContextPage } from "@/features/context/ContextPage";
import { TeamsPage } from "@/features/teams/TeamsPage";
import { NotFoundPage } from "@/features/NotFoundPage";
import { PublicOnlyRoute, ProtectedRoute } from "./guards";

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Navigate to="/projects" replace />,
      },
      { path: "/projects", element: <ProjectsPage /> },
      {
        path: "/projects/:projectId",
        element: <ProjectLayout />,
        children: [
          { index: true, element: <Navigate to="revisao" replace /> },
          { path: "revisao", element: <AnalysisPage /> },
          { path: "regras", element: <RulesPage /> },
          { path: "contexto", element: <ContextPage /> },
        ],
      },
      { path: "/times", element: <TeamsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
