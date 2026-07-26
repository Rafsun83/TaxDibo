import { useAuth } from "../context/AuthContext";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <section className="flex-1 space-y-6 p-4 md:p-6">
      <article className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
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

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["Email", user.email],
            ["Phone", user.phone],
            ["TIN", user.TIN ?? "Not set"],
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
      </article>
    </section>
  );
}
