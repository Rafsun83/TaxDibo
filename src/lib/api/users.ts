import { apiRequest } from "./client";
import type { AuthUser, UpdateUserPayload } from "./types";

export interface ListUsersParams {
  [key: string]: string | number | undefined;
  page?: number;
  size?: number;
}

export function listUsers(params: ListUsersParams = {}) {
  return apiRequest<AuthUser[]>("/users", { query: params });
}

export function getMe() {
  return apiRequest<AuthUser>("/users/me");
}

export function updateMe(payload: UpdateUserPayload) {
  return apiRequest<AuthUser>("/users/me", { method: "PUT", body: payload });
}
