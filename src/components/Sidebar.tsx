import { FileText, Home, UserRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Home", path: "/", icon: Home },
  { label: "Profile", path: "/profile", icon: UserRound },
  { label: "Documents", path: "/documents", icon: FileText },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside className="w-full rounded-xl border border-border/70 bg-card/95 p-4 shadow-2xl shadow-black/10 backdrop-blur xl:w-72">
      <div className="flex items-center gap-3 border-b border-border/80 pb-4">
        <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <Home className="size-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            TaxDibo
          </p>
          <h2 className="text-xl font-semibold">Dashboard</h2>
        </div>
      </div>

      <nav className="mt-6 space-y-2">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <Button
            key={path}
            variant={pathname === path ? "secondary" : "ghost"}
            className="w-full cursor-pointer justify-start gap-3 rounded-xl px-3 py-6 text-left shadow-none"
            onClick={() => navigate(path)}
          >
            <Icon className="size-4" />
            <span>{label}</span>
          </Button>
        ))}
      </nav>

      <div className="mt-8 rounded-3xl border border-border/70 bg-muted/60 p-4 text-sm text-muted-foreground">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">
          Overview
        </p>
        <p className="mt-2 text-foreground">
          Navigate between Home, Profile, and Documents using the menu above.
        </p>
      </div>
    </aside>
  );
}
