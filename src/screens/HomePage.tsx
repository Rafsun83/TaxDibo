import { Button } from "@/components/ui/button";

export default function HomePage() {
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
