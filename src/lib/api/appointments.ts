import { apiRequest } from "./client";
import type {
  Appointment,
  AppointmentDetails,
  AppointmentPayload,
  AppointmentStatus,
  DocumentMeta,
  Page,
} from "./types";

export interface ListAppointmentsParams {
  [key: string]: string | number | undefined;
  status?: AppointmentStatus;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export function createAppointment(payload: AppointmentPayload) {
  return apiRequest<Appointment>("/appointments", { method: "POST", body: payload });
}

export function listAppointments(params: ListAppointmentsParams = {}) {
  return apiRequest<Page<Appointment>>("/appointments", { query: params });
}

export function getAppointment(id: number) {
  return apiRequest<AppointmentDetails>(`/appointments/${id}`);
}

export function uploadAppointmentDocument(id: number, file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiRequest<DocumentMeta>(`/appointments/${id}/documents`, { method: "POST", body: form });
}
