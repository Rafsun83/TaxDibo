import { apiRequest } from "./client";
import type { AuthUser } from "./types";

export interface ListUsersParams {
  [key: string]: string | number | undefined;
  page?: number;
  size?: number;
}

export function listUsers(params: ListUsersParams = {}) {
  return apiRequest<AuthUser[]>("/users", { query: params });
}
