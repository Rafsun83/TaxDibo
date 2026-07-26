import { apiRequest } from "./client";
import type { AuthResponse, LoginPayload, RegisterPayload } from "./types";

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>("/auth/register", { method: "POST", body: payload, auth: false });
}

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>("/auth/login", { method: "POST", body: payload, auth: false });
}

export function googleSignIn(idToken: string) {
  return apiRequest<AuthResponse>("/auth/google", {
    method: "POST",
    body: { idToken },
    auth: false,
  });
}
