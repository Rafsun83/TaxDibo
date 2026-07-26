import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { ApiError } from "../lib/api/client";
import { listUsers } from "../lib/api/users";
import type { AuthUser } from "../lib/api/types";

export default function UsersPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const result = await listUsers({ size: 50 });
      setUsers(result);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, no data-fetching lib in use
    fetchUsers();
  }, [fetchUsers]);

  return (
    <section className="flex-1 space-y-6 p-4 md:p-6">
      <article className="overflow-hidden rounded-3xl border border-border/70 bg-background/90 shadow-sm">
        <div className="border-b border-border/70 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Admin
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">Users</h2>
        </div>

        {error && (
          <p className="mx-6 mt-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading users...
          </div>
        ) : users.length === 0 && !error ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No users found.</p>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">ID</th>
                  <th className="px-6 py-3 text-left font-medium">Name</th>
                  <th className="px-6 py-3 text-left font-medium">Email</th>
                  <th className="px-6 py-3 text-left font-medium">Phone</th>
                  <th className="px-6 py-3 text-left font-medium">TIN</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr
                    key={u.id}
                    className={`transition-colors hover:bg-muted/40 ${i !== users.length - 1 ? "border-b border-border/50" : ""}`}
                  >
                    <td className="px-6 py-4 text-muted-foreground">#{u.id}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{u.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                    <td className="px-6 py-4 text-muted-foreground">{u.phone}</td>
                    <td className="px-6 py-4 text-muted-foreground">{u.TIN ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </article>
    </section>
  );
}
