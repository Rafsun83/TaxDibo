import { useEffect, useState } from "react";
import { Bell, Home, Moon, Sun, UserRound } from "lucide-react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

function HomePage() {
  return (
    <section className="flex-1 space-y-6 p-4 md:p-6">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">
            Today
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-foreground">
            Your project overview is ready.
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            This route-based dashboard keeps the Home view focused and lets the
            Profile view handle account details.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button>Launch report</Button>
            <Button variant="outline">View profile</Button>
          </div>
        </article>

        <article className="rounded-3xl border border-border/70 bg-muted/70 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">
            Highlights
          </p>
          <div className="mt-4 space-y-4">
            {[
              ["Active menu", "2 items"],
              ["Theme mode", "Light / Dark"],
              ["Layout", "Responsive Holy Grail"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-border/70 bg-background/90 p-4"
              >
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[
          [
            "Home page",
            "Keep the main dashboard focused and clear for daily tasks.",
          ],
          ["Profile", "Show account details and quick actions in one place."],
          [
            "Notifications",
            "Track updates without leaving the main content area.",
          ],
        ].map(([title, description]) => (
          <article
            key={title}
            className="rounded-3xl border border-border/70 bg-background/90 p-5 shadow-sm"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Section
            </p>
            <h3 className="mt-3 text-xl font-semibold text-foreground">
              {title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProfilePage() {
  return (
    <section className="flex-1 space-y-6 p-4 md:p-6">
      <article className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-20 place-items-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground shadow-lg shadow-primary/20">
              JD
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                Profile
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">
                John Doe
              </h2>
              <p className="text-muted-foreground">Senior Product Designer</p>
            </div>
          </div>
          <Button variant="outline">Upload photo</Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["Email", "john.doe@taxdibo.dev", "email"],
            ["First name", "John", "text"],
            ["Last name", "Doe", "text"],
            ["Phone", "+1 (555) 012-3456", "tel"],
            ["Address", "128 Market Street, New York", "text"],
            ["Company name", "TaxDibo Labs", "text"],
          ].map(([label, value, type]) => (
            <label
              key={label}
              className="rounded-2xl border border-border/70 bg-muted/60 p-4 text-sm text-muted-foreground shadow-sm"
            >
              <span className="mb-2 block text-xs uppercase tracking-[0.3em] text-foreground/80">
                {label}
              </span>
              <input
                type={type}
                defaultValue={value}
                className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
            </label>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button>Save changes</Button>
          <Button variant="outline">Reset</Button>
        </div>
      </article>
    </section>
  );
}

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("taxdibo-theme") as
      | "light"
      | "dark"
      | null;

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const nextTheme = storedTheme ?? (prefersDark ? "dark" : "light");

    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem("taxdibo-theme", nextTheme);
  };

  const isProfileRoute = location.pathname === "/profile";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),_transparent_25%),linear-gradient(135deg,#0f172a_0%,#111827_45%,#172554_100%)] text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 p-4 lg:flex-row lg:p-6">
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

        <main className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col rounded-3xl border border-border/70 bg-card/95 shadow-2xl shadow-black/10 backdrop-blur">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-4 py-4 md:px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                Workspace
              </p>
              <h1 className="text-2xl font-semibold md:text-3xl">
                {isProfileRoute ? "Profile view" : "Home view"}
              </h1>
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
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
              </Button>
            </div>
          </header>

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
