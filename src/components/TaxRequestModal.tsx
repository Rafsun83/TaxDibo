import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api/client";
import { createAppointment } from "../lib/api/appointments";
import type { AppointmentPurpose } from "../lib/api/types";

interface TaxRequestModalProps {
  onClose: () => void;
}

const PURPOSE_OPTIONS: { value: AppointmentPurpose; label: string }[] = [
  { value: "TAX_SUBMISSION", label: "Tax submission" },
  { value: "TAX_CONSULTATION", label: "Tax consultation" },
  { value: "DOCUMENT_REVIEW", label: "Document review" },
  { value: "OTHER", label: "Other" },
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  tin: string;
  purpose: AppointmentPurpose;
  appointmentDate: string;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function TaxRequestModal({ onClose }: TaxRequestModalProps) {
  const { user } = useAuth();

  const [form, setForm] = useState<FormState>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    tin: user?.TIN ?? "",
    purpose: "TAX_SUBMISSION",
    appointmentDate: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      await createAppointment(form);
      setSubmitted(true);
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-2xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Tax services
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              Request for Tax Pay
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="grid size-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-400 text-2xl">
                ✓
              </div>
              <h3 className="text-lg font-semibold text-foreground">Request submitted!</h3>
              <p className="text-sm text-muted-foreground">
                We'll review your request and get back to you shortly.
              </p>
              <Button className="mt-2" onClick={onClose}>Done</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Full Name
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="rounded-xl border border-border/70 bg-muted/60 px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-ring/40"
                />
                {fieldErrors.name && <span className="text-xs text-destructive">{fieldErrors.name}</span>}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Email
                </span>
                <input
                  type="email"
                  placeholder="john@example.com"
                  required
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className="rounded-xl border border-border/70 bg-muted/60 px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-ring/40"
                />
                {fieldErrors.email && <span className="text-xs text-destructive">{fieldErrors.email}</span>}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Phone
                </span>
                <input
                  type="tel"
                  placeholder="+880 1X XX XXX XXX"
                  required
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  className="rounded-xl border border-border/70 bg-muted/60 px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-ring/40"
                />
                {fieldErrors.phone && <span className="text-xs text-destructive">{fieldErrors.phone}</span>}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  TIN Number
                </span>
                <input
                  type="text"
                  placeholder="10 or 12 digit TIN"
                  required
                  pattern="\d{10}|\d{12}"
                  title="TIN must be exactly 10 or 12 digits"
                  value={form.tin}
                  onChange={(e) => setField("tin", e.target.value)}
                  className="rounded-xl border border-border/70 bg-muted/60 px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-ring/40"
                />
                {fieldErrors.tin && <span className="text-xs text-destructive">{fieldErrors.tin}</span>}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Purpose
                </span>
                <select
                  required
                  value={form.purpose}
                  onChange={(e) => setField("purpose", e.target.value as AppointmentPurpose)}
                  className="rounded-xl border border-border/70 bg-muted/60 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40"
                >
                  {PURPOSE_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {fieldErrors.purpose && <span className="text-xs text-destructive">{fieldErrors.purpose}</span>}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Appointment Date
                </span>
                <input
                  type="date"
                  required
                  min={todayIso()}
                  value={form.appointmentDate}
                  onChange={(e) => setField("appointmentDate", e.target.value)}
                  className="rounded-xl border border-border/70 bg-muted/60 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40"
                />
                {fieldErrors.appointmentDate && (
                  <span className="text-xs text-destructive">{fieldErrors.appointmentDate}</span>
                )}
              </label>

              {error && (
                <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Request"}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
