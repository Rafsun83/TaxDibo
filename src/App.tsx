import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import DocumentsPage from "./screens/DocumentsPage";
import HomePage from "./screens/HomePage";
import ProfilePage from "./screens/ProfilePage";

const PAGE_TITLES: Record<string, string> = {
  "/": "Home view",
  "/profile": "Profile view",
  "/documents": "Documents view",
};

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => window.localStorage.getItem("taxdibo-sidebar-collapsed") === "true",
  );
  const { pathname } = useLocation();

  const title = PAGE_TITLES[pathname] ?? "Dashboard";

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("taxdibo-theme") as
      | "light"
      | "dark"
      | null;

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const nextTheme = storedTheme ?? (prefersDark ? "dark" : "light");

    // setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

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
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/documents" element={<DocumentsPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
