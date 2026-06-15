import { Home, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

interface SidebarProps {
  isProfileRoute: boolean;
}

export default function Sidebar({ isProfileRoute }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <aside className="w-full rounded-3xl border border-border/70 bg-card/95 p-4 shadow-2xl shadow-black/10 backdrop-blur xl:w-72">
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
        <Button
          variant={isProfileRoute ? "ghost" : "secondary"}
          className="w-full justify-start gap-3 rounded-2xl px-3 py-6 text-left shadow-none"
          onClick={() => navigate("/")}
        >
          <Home className="size-4" />
          <span>Home</span>
        </Button>

        <Button
          variant={isProfileRoute ? "secondary" : "ghost"}
          className="w-full justify-start gap-3 rounded-2xl px-3 py-6 text-left"
          onClick={() => navigate("/profile")}
        >
          <UserRound className="size-4" />
          <span>Profile</span>
        </Button>
      </nav>

      <div className="mt-8 rounded-3xl border border-border/70 bg-muted/60 p-4 text-sm text-muted-foreground">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">
          Overview
        </p>
        <p className="mt-2 text-foreground">
          Click Home or Profile in the navigation to switch between the two
          route views.
        </p>
      </div>
    </aside>
  );
}
