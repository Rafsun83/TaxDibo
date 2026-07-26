import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api/client";
import { listAppointments } from "../lib/api/appointments";
import type { Appointment, AppointmentPurpose, AppointmentStatus } from "../lib/api/types";

const PURPOSE_LABELS: Record<AppointmentPurpose, string> = {
  TAX_SUBMISSION: "Tax submission",
  TAX_CONSULTATION: "Tax consultation",
  DOCUMENT_REVIEW: "Document review",
  OTHER: "Other",
};

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-400",
  CONFIRMED: "bg-sky-500/15 text-sky-400",
  COMPLETED: "bg-emerald-500/15 text-emerald-400",
  CANCELLED: "bg-red-500/15 text-red-400",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      const result = await listAppointments({ size: 20, sort: "appointmentDate,desc" });
      setAppointments(result.content);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, no data-fetching lib in use
    fetchAppointments();
  }, [fetchAppointments]);

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

      <article className="overflow-hidden rounded-3xl border border-border/70 bg-background/90 shadow-sm">
        <div className="border-b border-border/70 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Booked requests
          </p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">My appointments</h3>
        </div>

        {error && (
          <p className="mx-6 mt-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            You haven't booked any appointments yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">Purpose</th>
                  <th className="px-6 py-3 text-left font-medium">Appointment date</th>
                  <th className="px-6 py-3 text-left font-medium">Requested</th>
                  <th className="px-6 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt, i) => (
                  <tr
                    key={appt.id}
                    className={`transition-colors hover:bg-muted/40 ${i !== appointments.length - 1 ? "border-b border-border/50" : ""}`}
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {PURPOSE_LABELS[appt.purpose]}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(appt.appointmentDate)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(appt.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[appt.status]}`}>
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}
