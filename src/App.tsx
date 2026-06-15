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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),_transparent_25%),linear-gradient(135deg,#0f172a_0%,#111827_45%,#172554_100%)] text-foreground">
      {/* max-w-7xl  */}
      <div className="mx-auto flex min-h-screen w-full flex-col gap-6 p-4 lg:flex-row lg:p-6">
        <Sidebar />

        <main className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col rounded-xl border border-border/70 bg-card/95 shadow-2xl shadow-black/10 backdrop-blur">
          <Header title={title} theme={theme} onToggleTheme={toggleTheme} />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/documents" element={<DocumentsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
