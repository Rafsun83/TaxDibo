import { Bell, LogOut, Moon, Sun, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  title: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function Header({ title, theme, onToggleTheme }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-4 py-4 md:px-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
          {user ? user.name : "Workspace"}
        </p>
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          aria-label="Profile"
          onClick={() => navigate("/profile")}
        >
          <UserRound className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={handleLogout}
          aria-label="Log out"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
