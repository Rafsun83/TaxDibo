import {
  CalendarCheck,
  Calculator,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Home,
  Users,
  UserRound,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { label: "Home", path: "/", icon: Home },
  { label: "Tax Calculator", path: "/tax-calculator", icon: Calculator },
  { label: "Documents", path: "/documents", icon: FileText },
  { label: "Appointments", path: "/appointments", icon: CalendarCheck },
];

const PROFILE_ITEM = { label: "Profile", path: "/profile", icon: UserRound };

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();

  const navItems = isAdmin
    ? [...NAV_ITEMS, { label: "Users", path: "/users", icon: Users }]
    : NAV_ITEMS;

  const renderNavButton = ({
    label,
    path,
    icon: Icon,
  }: (typeof NAV_ITEMS)[number]) => (
    <Button
      key={path}
      variant={pathname === path ? "secondary" : "ghost"}
      className={`w-full cursor-pointer justify-start rounded-md px-2 py-4 text-left shadow-none ${
        collapsed ? "lg:justify-center" : ""
      }`}
      title={collapsed ? label : undefined}
      aria-label={label}
      onClick={() => {
        navigate(path);
        onMobileClose();
      }}
    >
      <Icon className="size-4 shrink-0" />
      <span className={collapsed ? "lg:hidden" : undefined}>{label}</span>
    </Button>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 shrink-0 flex-col rounded-r-sm border-r border-border/70 bg-card/95 p-4 shadow-2xl shadow-black/10 backdrop-blur transition-transform duration-300 lg:static lg:inset-y-auto lg:z-auto lg:translate-x-0 lg:rounded-sm lg:border lg:transition-[width] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-20" : "lg:w-72"}`}
      >
        <div className="flex items-center gap-3 border-b border-border/80 pb-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Home className="size-5" />
          </div>
          <div className={`min-w-0 flex-1 ${collapsed ? "lg:hidden" : ""}`}>
            <p className="truncate text-xs uppercase tracking-[0.35em] text-muted-foreground">
              TaxDibo
            </p>
            <h2 className="truncate text-xl font-semibold">Dashboard</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto shrink-0 rounded-full lg:hidden"
            onClick={onMobileClose}
            aria-label="Close menu"
          >
            <X className="size-4" />
          </Button>
        </div>

        <nav className="mt-2 flex-1 space-y-1 overflow-y-auto">
          {navItems.map(renderNavButton)}
        </nav>

        <div className="space-y-2 border-t border-border/80 pt-1">
          {renderNavButton(PROFILE_ITEM)}
        </div>

        <Button
          variant="outline"
          size="icon"
          className={`mt-4 hidden shrink-0 rounded-xl lg:flex ${collapsed ? "self-center" : "self-end"}`}
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
    </>
  );
}
