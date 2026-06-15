import { Button } from "@/components/ui/button";

export default function ProfilePage() {
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
