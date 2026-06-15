import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import HomePage from "./screens/HomePage";
import ProfilePage from "./screens/ProfilePage";

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const location = useLocation();

  const isProfileRoute = location.pathname === "/profile";

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
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-4 lg:flex-row lg:p-6">
        <Sidebar isProfileRoute={isProfileRoute} />

        <main className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col rounded-3xl border border-border/70 bg-card/95 shadow-2xl shadow-black/10 backdrop-blur">
          <Header
            isProfileRoute={isProfileRoute}
            theme={theme}
            onToggleTheme={toggleTheme}
          />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
