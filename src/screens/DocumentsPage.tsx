import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Eye, Loader2, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "../lib/api/client";
import { deleteDocument, downloadDocument, listDocuments, uploadDocument } from "../lib/api/documents";
import type { DocumentMeta } from "../lib/api/types";

const PAGE_SIZE = 10;

const CONTENT_TYPE_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
};

function contentTypeLabel(contentType: string) {
  return CONTENT_TYPE_LABELS[contentType] ?? contentType.split("/")[1]?.toUpperCase() ?? contentType;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
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
            <h2 className="mt-1 text-lg font-semibold text-foreground">{doc.originalFileName}</h2>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose} aria-label="Close modal">
            <X className="size-4" />
          </Button>
        </div>

        <div className="overflow-y-auto p-6">
          {isImage ? (
            <img src={objectUrl} alt={doc.originalFileName} className="mx-auto max-h-[70vh] rounded-2xl" />
          ) : doc.contentType === "application/pdf" ? (
            <iframe src={objectUrl} title={doc.originalFileName} className="h-[70vh] w-full rounded-2xl border border-border/70" />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Preview isn't available for this file type. Use Download to save it locally.
            </p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-2xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Delete document</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">{doc.originalFileName}</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            This will permanently delete this document. This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t border-border/70 px-6 py-4">
          <Button variant="outline" size="sm" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" className="gap-1.5" onClick={onConfirm} disabled={deleting}>
            {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [busyDocId, setBusyDocId] = useState<number | null>(null);
  const [preview, setPreview] = useState<{ doc: DocumentMeta; url: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DocumentMeta | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async (targetPage: number) => {
    try {
      const result = await listDocuments({ page: targetPage, size: PAGE_SIZE });
      setDocuments(result.content);
      setTotalPages(result.totalPages);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount/page-change, no data-fetching lib in use
    fetchDocuments(page);
  }, [page, fetchDocuments]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      await uploadDocument(file);
      await fetchDocuments(0);
      setPage(0);
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleView = async (doc: DocumentMeta) => {
    setBusyDocId(doc.id);
    try {
      const { blob } = await downloadDocument(doc.id);
      setPreview({ doc, url: URL.createObjectURL(blob) });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to open document.");
    } finally {
      setBusyDocId(null);
    }
  };

  const handleDownload = async (doc: DocumentMeta) => {
    setBusyDocId(doc.id);
    try {
      const { blob, filename } = await downloadDocument(doc.id);
      triggerBrowserDownload(blob, filename || doc.originalFileName);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to download document.");
    } finally {
      setBusyDocId(null);
    }
  };

  const closePreview = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDocument(deleteTarget.id);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete document.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="flex-1 space-y-6 p-4 md:p-6">
      <article className="overflow-hidden rounded-3xl border border-border/70 bg-background/90 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              All files
            </p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">Documents</h2>
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
        {error && (
          <p className="mx-6 mt-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading documents...
          </div>
        ) : documents.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No documents uploaded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">Name</th>
                  <th className="px-6 py-3 text-left font-medium">Type</th>
                  <th className="px-6 py-3 text-left font-medium">Uploaded</th>
                  <th className="px-6 py-3 text-left font-medium">Size</th>
                  <th className="px-6 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, i) => (
                  <tr
                    key={doc.id}
                    className={`transition-colors hover:bg-muted/40 ${i !== documents.length - 1 ? "border-b border-border/50" : ""}`}
                  >
                    <td className="px-6 py-4 font-medium text-foreground">{doc.originalFileName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{contentTypeLabel(doc.contentType)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(doc.uploadedAt)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatBytes(doc.fileSize)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 rounded-xl text-xs"
                          disabled={busyDocId === doc.id}
                          onClick={() => handleView(doc)}
                        >
                          <Eye className="size-3.5" /> View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 rounded-xl text-xs"
                          disabled={busyDocId === doc.id}
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="size-3.5" /> Download
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1.5 rounded-xl text-xs"
                          disabled={busyDocId === doc.id}
                          onClick={() => setDeleteTarget(doc)}
                        >
                          <Trash2 className="size-3.5" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 px-4 py-4 text-sm text-muted-foreground sm:px-6">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </article>

      {preview && <PreviewModal doc={preview.doc} objectUrl={preview.url} onClose={closePreview} />}
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
