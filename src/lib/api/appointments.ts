import { apiRequest } from "./client";
import type { Appointment, AppointmentPayload, AppointmentStatus, Page } from "./types";

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
