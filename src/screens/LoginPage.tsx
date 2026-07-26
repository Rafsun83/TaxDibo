import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api/client";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      const from = (location.state as { from?: Location })?.from?.pathname ?? "/";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your tax filings">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Email
          </span>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-border/70 bg-muted/60 px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-ring/40"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Password
          </span>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-border/70 bg-muted/60 px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-ring/40"
          />
        </label>

        {error && (
          <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
