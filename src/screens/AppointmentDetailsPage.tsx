import {
  ArrowLeft,
  Check,
  Download,
  Eye,
  FileText,
  FolderOpen,
  LayoutGrid,
  List,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  deleteAppointmentDocument,
  getAppointment,
  uploadAppointmentDocument,
} from "../lib/api/appointments";
import { ApiError } from "../lib/api/client";
import { downloadDocument, listDocuments } from "../lib/api/documents";
import type {
  AppointmentDetails,
  AppointmentPurpose,
  AppointmentStatus,
  DocumentMeta,
} from "../lib/api/types";

const PURPOSE_LABELS: Record<AppointmentPurpose, string> = {
  TAX_SUBMISSION: "Tax submission",
  TAX_CONSULTATION: "Tax consultation",
  DOCUMENT_REVIEW: "Document review",
  OTHER: "Other",
};

const TRACKING_STEPS: { status: AppointmentStatus; label: string }[] = [
  { status: "PENDING", label: "Requested" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "READY", label: "File Ready" },
  { status: "COMPLETED", label: "Completed" },
];

// Refetch on an interval so the tracking bar reflects status changes made elsewhere
// (e.g. an admin confirming/completing the appointment) without a manual page reload.
const LIVE_REFRESH_MS = 15_000;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

  const currentIndex = TRACKING_STEPS.findIndex(
    (step) => step.status === status,
  );

  return (
    <div className="flex min-w-max items-center">
      {TRACKING_STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        const isLast = i === TRACKING_STEPS.length - 1;
        return (
          <div
            key={step.status}
            className="flex flex-1 items-center last:flex-none"
          >
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
              <span
                className={`whitespace-nowrap text-xs font-medium ${reached ? "text-foreground" : "text-muted-foreground"}`}
              >
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

function PreviewModal({
  doc,
  objectUrl,
  onClose,
}: {
  doc: DocumentMeta;
  objectUrl: string;
  onClose: () => void;
}) {
  const isImage = doc.contentType.startsWith("image/");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-2xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Document preview
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              {doc.originalFileName}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="overflow-y-auto p-6">
          {isImage ? (
            <img
              src={objectUrl}
              alt={doc.originalFileName}
              className="mx-auto max-h-[70vh] rounded-2xl"
            />
          ) : doc.contentType === "application/pdf" ? (
            <iframe
              src={objectUrl}
              title={doc.originalFileName}
              className="h-[70vh] w-full rounded-2xl border border-border/70"
            />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Preview isn't available for this file type. Use Download to save
              it locally.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ExistingDocumentsModal({
  documents,
  loading,
  error,
  attachingDocId,
  attachError,
  onAttach,
  onClose,
}: {
  documents: DocumentMeta[] | null;
  loading: boolean;
  error: string | null;
  attachingDocId: number | null;
  attachError: string | null;
  onAttach: (doc: DocumentMeta) => void;
  onClose: () => void;
}) {
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
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Reuse a document
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              Choose an existing document
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="overflow-y-auto">
          {attachError && (
            <p className="mx-6 mt-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {attachError}
            </p>
          )}
          {error && (
            <p className="mx-6 mt-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {error}
            </p>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading your
              documents...
            </div>
          ) : !documents || documents.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              You don't have any other documents to reuse yet.
            </p>
          ) : (
            <ul className="divide-y divide-border/50">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-3 px-6 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted/60 text-muted-foreground">
                      <FileText className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {doc.originalFileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(doc.fileSize)} ·{" "}
                        {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0 gap-1.5 rounded-xl text-xs"
                    disabled={attachingDocId === doc.id}
                    onClick={() => onAttach(doc)}
                  >
                    {attachingDocId === doc.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : null}
                    {attachingDocId === doc.id ? "Attaching..." : "Attach"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({
  doc,
  deleting,
  onConfirm,
  onClose,
}: {
  doc: DocumentMeta;
  deleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-2xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Delete document
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            {doc.originalFileName}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            This will permanently delete this document from the appointment.
            This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t border-border/70 px-6 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const appointmentId = Number(id);

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [busyDocId, setBusyDocId] = useState<number | null>(null);
  const [preview, setPreview] = useState<{
    doc: DocumentMeta;
    url: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDocuments, setPickerDocuments] = useState<DocumentMeta[] | null>(
    null,
  );
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [attachingDocId, setAttachingDocId] = useState<number | null>(null);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DocumentMeta | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestedThumbnails = useRef<Set<number>>(new Set());
  const thumbnailUrlsRef = useRef<string[]>([]);

  const fetchAppointment = useCallback(async () => {
    try {
      const result = await getAppointment(appointmentId);
      setAppointment(result);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load appointment.",
      );
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

  // Grid view shows real image thumbnails so a user can tell documents apart at a glance —
  // fetch each image document's bytes once and cache the object URL.
  useEffect(() => {
    if (!appointment) return;
    appointment.documents
      .filter(
        (doc) =>
          doc.contentType.startsWith("image/") &&
          !requestedThumbnails.current.has(doc.id),
      )
      .forEach((doc) => {
        requestedThumbnails.current.add(doc.id);
        downloadDocument(doc.id)
          .then(({ blob }) => {
            const url = URL.createObjectURL(blob);
            thumbnailUrlsRef.current.push(url);
            setThumbnails((prev) => ({ ...prev, [doc.id]: url }));
          })
          .catch(() => {
            // best-effort — the grid falls back to a generic file icon if the thumbnail fails to load
          });
      });
  }, [appointment]);

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: read the accumulated list at unmount time, not a mount-time snapshot
      thumbnailUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

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

  const openPicker = async () => {
    setShowPicker(true);
    setAttachError(null);
    setPickerLoading(true);
    setPickerError(null);
    try {
      const result = await listDocuments({ size: 50 });
      setPickerDocuments(
        result.content.filter((doc) => doc.appointmentId !== appointmentId),
      );
    } catch (err) {
      setPickerError(
        err instanceof ApiError
          ? err.message
          : "Failed to load your documents.",
      );
    } finally {
      setPickerLoading(false);
    }
  };

  const closePicker = () => {
    setShowPicker(false);
    setPickerDocuments(null);
  };

  // The backend has no "link existing document" endpoint, so reusing a document
  // means re-fetching its bytes and re-uploading them against this appointment —
  // the user just doesn't have to browse their device for the file again.
  const handleAttachExisting = async (doc: DocumentMeta) => {
    setAttachingDocId(doc.id);
    setAttachError(null);
    try {
      const { blob } = await downloadDocument(doc.id);
      const file = new File([blob], doc.originalFileName, {
        type: doc.contentType,
      });
      await uploadAppointmentDocument(appointmentId, file);
      await fetchAppointment();
      setPickerDocuments(
        (prev) => prev?.filter((d) => d.id !== doc.id) ?? null,
      );
    } catch (err) {
      setAttachError(
        err instanceof ApiError ? err.message : "Failed to attach document.",
      );
    } finally {
      setAttachingDocId(null);
    }
  };

  const handleView = async (doc: DocumentMeta) => {
    setBusyDocId(doc.id);
    try {
      const { blob } = await downloadDocument(doc.id);
      setPreview({ doc, url: URL.createObjectURL(blob) });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to open document.",
      );
    } finally {
      setBusyDocId(null);
    }
  };

  const closePreview = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
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
      setError(
        err instanceof ApiError ? err.message : "Failed to download document.",
      );
    } finally {
      setBusyDocId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAppointmentDocument(appointmentId, deleteTarget.id);
      await fetchAppointment();
      setDeleteTarget(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to delete document.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="flex-1 space-y-6 p-4 md:p-6">
      <Button
        variant="ghost"
        className="gap-2 px-0 text-muted-foreground"
        onClick={() => navigate("/appointments")}
      >
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
                  Scheduled for {formatDate(appointment.appointmentDate)} ·
                  Requested {formatDateTime(appointment.createdAt)}
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto pb-1">
              <TrackingBar status={appointment.status} />
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                {error}
              </p>
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
                  <span className="mb-2 block text-xs uppercase tracking-[0.3em] text-foreground/80">
                    {label}
                  </span>
                  <p className="text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="overflow-hidden rounded-3xl border border-border/70 bg-background/90 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                  Attachments
                </p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  Documents
                </h3>
              </div>

              <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
                <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-muted/60 p-1">
                  <Button
                    type="button"
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    className="size-8 rounded-lg"
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    title="Grid view"
                  >
                    <LayoutGrid className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    className="size-8 rounded-lg"
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                    title="List view"
                  >
                    <List className="size-4" />
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  onChange={handleUpload}
                />
                <Button
                  variant="outline"
                  onClick={openPicker}
                  className="flex-1 gap-2 sm:flex-none"
                >
                  <FolderOpen className="size-4" />
                  Choose existing
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 gap-2 sm:flex-none"
                >
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  {uploading ? "Uploading..." : "Upload from device"}
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
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 lg:grid-cols-4">
                {appointment.documents.map((doc) => (
                  <div
                    key={doc.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleView(doc)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleView(doc);
                    }}
                    aria-disabled={busyDocId === doc.id}
                    className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-muted/60 text-left shadow-sm outline-none transition hover:border-primary/60 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/40 ${busyDocId === doc.id ? "cursor-wait opacity-60" : "cursor-pointer"}`}
                  >
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 z-10 size-7 rounded-full opacity-0 shadow-sm transition group-hover:opacity-100"
                      aria-label="Delete document"
                      title="Delete document"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(doc);
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                    <div className="flex aspect-square items-center justify-center overflow-hidden bg-background/60">
                      {thumbnails[doc.id] ? (
                        <img
                          src={thumbnails[doc.id]}
                          alt={doc.originalFileName}
                          className="size-full object-cover transition group-hover:scale-105"
                        />
                      ) : (
                        <FileText className="size-10 text-muted-foreground" />
                      )}
                    </div>
                    <div className="border-t border-border/70 px-3 py-2.5">
                      <p className="truncate text-xs font-medium text-foreground">
                        {doc.originalFileName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatBytes(doc.fileSize)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {appointment.documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted/60 text-muted-foreground">
                        <FileText className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {doc.originalFileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(doc.fileSize)} ·{" "}
                          {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 rounded-xl text-xs"
                        disabled={busyDocId === doc.id}
                        onClick={() => handleView(doc)}
                      >
                        <Eye className="size-3.5" /> <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 rounded-xl text-xs"
                        disabled={busyDocId === doc.id}
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="size-3.5" /> <span className="hidden sm:inline">Download</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1.5 rounded-xl text-xs"
                        disabled={busyDocId === doc.id}
                        onClick={() => setDeleteTarget(doc)}
                      >
                        <Trash2 className="size-3.5" /> <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </>
      )}

      {preview && (
        <PreviewModal
          doc={preview.doc}
          objectUrl={preview.url}
          onClose={closePreview}
        />
      )}

      {showPicker && (
        <ExistingDocumentsModal
          documents={pickerDocuments}
          loading={pickerLoading}
          error={pickerError}
          attachingDocId={attachingDocId}
          attachError={attachError}
          onAttach={handleAttachExisting}
          onClose={closePicker}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          doc={deleteTarget}
          deleting={deleting}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </section>
  );
}
