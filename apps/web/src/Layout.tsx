import { Link, Outlet } from "react-router-dom";
import Button from "./components/Button";
import { useAuth } from "./features/auth/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const initial = user?.name?.trim().charAt(0).toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-carbon-900">
      <header className="bg-carbon-900 border-b-4 border-papaya-500">
        <div className="px-6 py-3 flex items-center justify-between">
          <Link to="/projects" className="font-extrabold text-lg text-white tracking-tight">
            Code<span className="text-papaya-500">Reviewer</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-carbon-100">
              <span className="w-7 h-7 rounded-full bg-papaya-500 text-white flex items-center justify-center text-xs font-bold">
                {initial}
              </span>
              {user?.name}
            </div>
            <Button variant="ghost" onClick={logout} className="!bg-carbon-800 !text-carbon-200 hover:!bg-carbon-700">
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
