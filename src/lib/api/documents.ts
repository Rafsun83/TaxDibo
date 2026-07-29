import { apiDownload, apiRequest } from "./client";
import type { DocumentMeta, Page } from "./types";

export interface ListDocumentsParams {
  [key: string]: string | number | undefined;
  page?: number;
  size?: number;
  userId?: number;
}

export function uploadDocument(file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiRequest<DocumentMeta>("/documents/upload", { method: "POST", body: form });
}

export function listDocuments(params: ListDocumentsParams = {}) {
  return apiRequest<Page<DocumentMeta>>("/documents", { query: params });
}

export function downloadDocument(id: number) {
  return apiDownload(`/documents/${id}/download`);
}

export function deleteDocument(id: number) {
  return apiRequest<void>(`/documents/${id}`, { method: "DELETE" });
}
