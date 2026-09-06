import { Home } from "lucide-react";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.12),transparent_25%),linear-gradient(135deg,#0f172a_0%,#111827_45%,#172554_100%)] p-4 text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-border/70 bg-card/95 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Home className="size-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              TaxDibo
            </p>
            <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
