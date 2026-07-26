import {
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Home,
  Users,
  UserRound,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { label: "Home", path: "/", icon: Home },
  { label: "Profile", path: "/profile", icon: UserRound },
  { label: "Documents", path: "/documents", icon: FileText },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();

  const navItems = isAdmin
    ? [...NAV_ITEMS, { label: "Users", path: "/users", icon: Users }]
    : NAV_ITEMS;

  return (
    <aside
      className={`flex h-full shrink-0 flex-col rounded-sm border border-border/70 bg-card/95 p-4 shadow-2xl shadow-black/10 backdrop-blur transition-[width] duration-300 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <div className="flex items-center gap-3 border-b border-border/80 pb-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <Home className="size-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs uppercase tracking-[0.35em] text-muted-foreground">
              TaxDibo
            </p>
            <h2 className="truncate text-xl font-semibold">Dashboard</h2>
          </div>
        )}
      </div>

      <nav className="mt-6 flex-1 space-y-2 overflow-y-auto">
        {navItems.map(({ label, path, icon: Icon }) => (
          <Button
            key={path}
            variant={pathname === path ? "secondary" : "ghost"}
            className={`w-full cursor-pointer gap-3 rounded-xl px-3 py-6 text-left shadow-none ${
              collapsed ? "justify-center" : "justify-start"
            }`}
            title={collapsed ? label : undefined}
            aria-label={label}
            onClick={() => navigate(path)}
          >
            <Icon className="size-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Button>
        ))}
      </nav>

      {!collapsed && (
        <div className="mt-8 rounded-3xl border border-border/70 bg-muted/60 p-4 text-sm text-muted-foreground">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">
            Overview
          </p>
          <p className="mt-2 text-foreground">
            Navigate between Home, Profile, and Documents using the menu above.
          </p>
        </div>
      )}

      <Button
        variant="outline"
        size="icon"
        className={`mt-4 shrink-0 rounded-xl ${collapsed ? "self-center" : "self-end"}`}
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronsRight className="size-4" />
        ) : (
          <ChevronsLeft className="size-4" />
        )}
      </Button>
    </aside>
  );
}
