import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Download, FileText, Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ApiError } from "../lib/api/client";
import { getAppointment, uploadAppointmentDocument } from "../lib/api/appointments";
import { downloadDocument } from "../lib/api/documents";
import type { AppointmentDetails, AppointmentPurpose, AppointmentStatus, DocumentMeta } from "../lib/api/types";

const PURPOSE_LABELS: Record<AppointmentPurpose, string> = {
  TAX_SUBMISSION: "Tax submission",
  TAX_CONSULTATION: "Tax consultation",
  DOCUMENT_REVIEW: "Document review",
  OTHER: "Other",
};

const TRACKING_STEPS: { status: AppointmentStatus; label: string }[] = [
  { status: "PENDING", label: "Requested" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "COMPLETED", label: "Completed" },
];

// Refetch on an interval so the tracking bar reflects status changes made elsewhere
// (e.g. an admin confirming/completing the appointment) without a manual page reload.
const LIVE_REFRESH_MS = 15_000;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function TrackingBar({ status }: { status: AppointmentStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-400">
        This appointment has been cancelled.
      </div>
    );
  }

  const currentIndex = TRACKING_STEPS.findIndex((step) => step.status === status);

  return (
    <div className="flex items-center">
      {TRACKING_STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        const isLast = i === TRACKING_STEPS.length - 1;
        return (
          <div key={step.status} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`grid size-9 shrink-0 place-items-center rounded-full border-2 text-xs font-semibold transition-colors ${
                  reached
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/70 bg-muted/60 text-muted-foreground"
                }`}
              >
                {reached ? <Check className="size-4" /> : i + 1}
              </div>
              <span className={`whitespace-nowrap text-xs font-medium ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`mx-2 h-0.5 flex-1 rounded-full transition-colors ${i < currentIndex ? "bg-primary" : "bg-border/70"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AppointmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const appointmentId = Number(id);

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [busyDocId, setBusyDocId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAppointment = useCallback(async () => {
    try {
      const result = await getAppointment(appointmentId);
      setAppointment(result);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load appointment.");
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, no data-fetching lib in use
    fetchAppointment();
    const interval = setInterval(fetchAppointment, LIVE_REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchAppointment]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      await uploadAppointmentDocument(appointmentId, file);
      await fetchAppointment();
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (doc: DocumentMeta) => {
    setBusyDocId(doc.id);
    try {
      const { blob, filename } = await downloadDocument(doc.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename || doc.originalFileName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to download document.");
    } finally {
      setBusyDocId(null);
    }
  };

  return (
    <section className="flex-1 space-y-6 p-4 md:p-6">
      <Button variant="ghost" className="gap-2 px-0 text-muted-foreground" onClick={() => navigate("/appointments")}>
        <ArrowLeft className="size-4" /> Back to appointments
      </Button>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-3xl border border-border/70 bg-background/90 py-16 text-sm text-muted-foreground shadow-sm">
          <Loader2 className="size-4 animate-spin" /> Loading appointment...
        </div>
      ) : !appointment ? (
        <p className="rounded-3xl border border-border/70 bg-destructive/10 px-6 py-5 text-sm text-destructive shadow-sm">
          {error ?? "Appointment not found."}
        </p>
      ) : (
        <>
          <article className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                  Appointment #{appointment.id}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">
                  {PURPOSE_LABELS[appointment.purpose]}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Scheduled for {formatDate(appointment.appointmentDate)} · Requested{" "}
                  {formatDateTime(appointment.createdAt)}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <TrackingBar status={appointment.status} />
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{error}</p>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ["Name", appointment.name],
                ["Email", appointment.email],
                ["Phone", appointment.phone],
                ["TIN", appointment.tin],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border/70 bg-muted/60 p-4 text-sm text-muted-foreground shadow-sm"
                >
                  <span className="mb-2 block text-xs uppercase tracking-[0.3em] text-foreground/80">{label}</span>
                  <p className="text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="overflow-hidden rounded-3xl border border-border/70 bg-background/90 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Attachments</p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">Documents</h3>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  onChange={handleUpload}
                />
                <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
                  {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                  {uploading ? "Uploading..." : "Upload document"}
                </Button>
              </div>
            </div>

            {uploadError && (
              <p className="mx-6 mt-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                {uploadError}
              </p>
            )}

            {appointment.documents.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No documents attached to this appointment yet.
              </p>
            ) : (
              <ul className="divide-y divide-border/50">
                {appointment.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-3 px-6 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted/60 text-muted-foreground">
                        <FileText className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{doc.originalFileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(doc.fileSize)} · {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1.5 rounded-xl text-xs"
                      disabled={busyDocId === doc.id}
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="size-3.5" /> Download
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </>
      )}
    </section>
  );
}
