export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  TIN: string | null;
  company: string | null;
  address: string | null;
}

export interface UpdateUserPayload {
  name: string;
  phone: string;
  tin: string;
  company?: string;
  address?: string;
}

export interface AuthResponse {
  tokenType: string;
  accessToken: string;
  user: AuthUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  company?: string;
  address?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export type AppointmentPurpose =
  | "TAX_SUBMISSION"
  | "TAX_CONSULTATION"
  | "DOCUMENT_REVIEW"
  | "OTHER";

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface AppointmentPayload {
  name: string;
  email: string;
  phone: string;
  tin: string;
  purpose: AppointmentPurpose;
  appointmentDate: string;
}

export interface Appointment extends AppointmentPayload {
  id: number;
  userId: number;
  status: AppointmentStatus;
  createdAt: string;
}

export interface DocumentMeta {
  id: number;
  userId: number;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface Page<T> {
  content: T[];
  pageable: { pageNumber: number; pageSize: number };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface ApiErrorBody {
  timestamp: string;
  status: number;
  message: string;
  errors?: Record<string, string>;
}
