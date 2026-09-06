import { Bell, LogOut, Menu, Moon, Sun, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  title: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenMobileNav: () => void;
}

export default function Header({
  title,
  theme,
  onToggleTheme,
  onOpenMobileNav,
}: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex flex-nowrap items-center justify-between gap-2 border-b border-border/80 px-4 py-4 md:gap-3 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 rounded-full lg:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open menu"
        >
          <Menu className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs uppercase tracking-[0.35em] text-muted-foreground">
            {user ? user.name : "Workspace"}
          </p>
          <h1 className="truncate text-xl font-semibold sm:text-2xl md:text-3xl">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
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
