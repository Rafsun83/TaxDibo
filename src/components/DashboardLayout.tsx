import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";

const PAGE_TITLES: Record<string, string> = {
  "/": "Home view",
  "/tax-calculator": "Tax calculator view",
  "/profile": "Profile view",
  "/appointments": "Appointments view",
  "/documents": "Documents view",
  "/users": "Users view",
};

export default function DashboardLayout() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => window.localStorage.getItem("taxdibo-sidebar-collapsed") === "true",
  );
  const { pathname } = useLocation();

  const title = PAGE_TITLES[pathname] ?? "Dashboard";

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem("taxdibo-theme", nextTheme);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem("taxdibo-sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.12),transparent_25%),linear-gradient(135deg,#0f172a_0%,#111827_45%,#172554_100%)] text-foreground">
      <div className="mx-auto flex h-full w-full gap-2 p-2 lg:gap-2 lg:p-2">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

        <main className="flex h-full flex-1 flex-col overflow-hidden rounded-sm border border-border/70 bg-card/95 shadow-2xl shadow-black/10 backdrop-blur">
          <Header title={title} theme={theme} onToggleTheme={toggleTheme} />

          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
