import { NavLink } from "react-router-dom";
import { FolderGit2, Users, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/features/auth/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { Menu, MenuItem } from "@/components/ui/Menu";
import { Logo } from "./Logo";

const NAV_ITEMS = [
  { to: "/projects", label: "Projetos", icon: FolderGit2 },
  { to: "/times", label: "Times", icon: Users },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Logo />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar menu"
          className="rounded-full p-1.5 text-subtle transition-colors hover:bg-raised hover:text-ink lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Navegação principal">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-field px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-papaya-500/10 text-papaya-300"
                  : "text-muted hover:bg-raised hover:text-ink",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "h-4 w-[3px] rounded-full transition-colors",
                    isActive ? "bg-papaya-500" : "bg-transparent",
                  )}
                  aria-hidden
                />
                <item.icon className="h-4 w-4" />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {user ? (
        <div className="border-t border-line p-3">
          <Menu
            align="left"
            className="w-full"
            trigger={(props) => (
              <button
                {...props}
                className="flex w-full items-center gap-3 rounded-field px-2 py-2 text-left transition-colors hover:bg-raised"
              >
                <Avatar name={user.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-ink">
                    {user.name}
                  </span>
                  <span className="block truncate text-[11px] text-subtle">
                    {user.email}
                  </span>
                </span>
              </button>
            )}
          >
            <MenuItem onClick={() => void logout()}>Sair da conta</MenuItem>
          </Menu>
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-line bg-surface/50 backdrop-blur-sm lg:block">
        {content}
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          onClick={onClose}
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line bg-surface transition-transform duration-200",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {content}
        </aside>
      </div>
    </>
  );
}
