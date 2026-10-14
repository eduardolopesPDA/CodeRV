import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu as MenuIcon } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Logo } from "./Logo";

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-bg/85 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
            className="rounded-field border border-line bg-surface p-2 text-muted transition-colors hover:text-ink"
          >
            <MenuIcon className="h-4 w-4" />
          </button>
          <Logo to="/projects" />
        </header>

        <main key={location.pathname} className="min-w-0 flex-1 animate-fade-in">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
