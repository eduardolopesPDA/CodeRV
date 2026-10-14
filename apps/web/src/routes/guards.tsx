import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { FullScreenLoader } from "@/components/layout/FullScreenLoader";
import { useAuth } from "@/features/auth/AuthContext";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader label="Verificando sua sessão..." />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <AppShell />;
}

export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from ?? "/projects";

  if (loading) return <FullScreenLoader label="Verificando sua sessão..." />;
  if (user) return <Navigate to={from} replace />;
  return <Outlet />;
}
