import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api/client";
import { updateMe } from "../lib/api/users";
import type { UpdateUserPayload } from "../lib/api/types";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

type FormState = UpdateUserPayload;

function formFromUser(user: { name: string; phone: string; TIN: string | null; company: string | null; address: string | null }): FormState {
  return {
    name: user.name,
    phone: user.phone,
    tin: user.TIN ?? "",
    company: user.company ?? "",
    address: user.address ?? "",
  };
}

export default function ProfilePage() {
  const { user, updateUser, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      await refreshUser();
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, no data-fetching lib in use
    loadProfile();
  }, [loadProfile]);

  const startEditing = () => {
    if (!user) return;
    setForm(formFromUser(user));
    setError(null);
    setFieldErrors({});
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setForm(null);
    setError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      const updated = await updateMe({
        name: form.name,
        phone: form.phone,
        tin: form.tin,
        company: form.company || undefined,
        address: form.address || undefined,
      });
      updateUser(updated);
      setEditing(false);
      setForm(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.errors ?? {});
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="flex-1 p-4 md:p-6">
        <div className="flex items-center justify-center gap-2 rounded-3xl border border-border/70 bg-background/90 py-16 text-sm text-muted-foreground shadow-sm">
          <Loader2 className="size-4 animate-spin" /> Loading profile...
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="flex-1 p-4 md:p-6">
        <p className="rounded-3xl border border-border/70 bg-destructive/10 px-6 py-5 text-sm text-destructive shadow-sm">
          {loadError ?? "Unable to load profile."}
        </p>
      </section>
    );
  }

  return (
    <section className="flex-1 space-y-6 p-4 md:p-6">
      <article className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid size-20 place-items-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground shadow-lg shadow-primary/20">
              {initials(user.name) || "?"}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                Profile
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          {!editing && (
            <Button variant="outline" onClick={startEditing}>
              Edit profile
            </Button>
          )}
        </div>

        {loadError && (
          <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {loadError}
          </p>
        )}

        {editing && form ? (
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Name
              </span>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((prev) => prev && { ...prev, name: e.target.value })}
                className="rounded-xl border border-border/70 bg-muted/60 px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
              {fieldErrors.name && (
                <span className="text-xs text-destructive">{fieldErrors.name}</span>
              )}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Phone
              </span>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm((prev) => prev && { ...prev, phone: e.target.value })}
                className="rounded-xl border border-border/70 bg-muted/60 px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
              {fieldErrors.phone && (
                <span className="text-xs text-destructive">{fieldErrors.phone}</span>
              )}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                TIN
              </span>
              <input
                type="text"
                required
                placeholder="10 or 12 digit TIN"
                value={form.tin}
                onChange={(e) => setForm((prev) => prev && { ...prev, tin: e.target.value })}
                className="rounded-xl border border-border/70 bg-muted/60 px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
              {fieldErrors.tin && (
                <span className="text-xs text-destructive">{fieldErrors.tin}</span>
              )}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Company (optional)
              </span>
              <input
                type="text"
                value={form.company ?? ""}
                onChange={(e) => setForm((prev) => prev && { ...prev, company: e.target.value })}
                className="rounded-xl border border-border/70 bg-muted/60 px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
              {fieldErrors.company && (
                <span className="text-xs text-destructive">{fieldErrors.company}</span>
              )}
            </label>

            <label className="flex flex-col gap-1.5 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Address (optional)
              </span>
              <input
                type="text"
                value={form.address ?? ""}
                onChange={(e) => setForm((prev) => prev && { ...prev, address: e.target.value })}
                className="rounded-xl border border-border/70 bg-muted/60 px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
              {fieldErrors.address && (
                <span className="text-xs text-destructive">{fieldErrors.address}</span>
              )}
            </label>

            {error && (
              <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive md:col-span-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 md:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save changes"}
              </Button>
              <Button type="button" variant="outline" onClick={cancelEditing} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Email", user.email],
              ["Phone", user.phone],
              ["TIN", user.TIN ?? "Not set"],
              ["Company", user.company ?? "Not set"],
              ["Address", user.address ?? "Not set"],
              ["User ID", `#${user.id}`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-border/70 bg-muted/60 p-4 text-sm text-muted-foreground shadow-sm"
              >
                <span className="mb-2 block text-xs uppercase tracking-[0.3em] text-foreground/80">
                  {label}
                </span>
                <p className="text-foreground">{value}</p>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
