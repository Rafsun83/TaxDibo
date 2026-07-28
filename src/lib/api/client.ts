import type { ApiErrorBody } from "./types";

// Relative so the Vite dev proxy (see vite.config.ts) forwards to the backend —
// the backend itself sends no Access-Control-Allow-Origin headers.
const API_BASE = "/api";
const TOKEN_KEY = "taxdibo-token";
const USER_KEY = "taxdibo-user";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.status = body.status;
    this.errors = body.errors;
  }
}

export function getToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function storeSession(token: string, user: unknown) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function storeUser(user: unknown) {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    return await response.json();
  } catch {
    return { timestamp: "", status: response.status, message: response.statusText };
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(API_BASE + path, window.location.origin);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
  }
  return url.pathname + url.search;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, query } = options;
  const headers: Record<string, string> = {};
  let payload: BodyInit | undefined;

  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, query), { method, headers, body: payload });

  if (response.status === 401 && auth) {
    clearSession();
    window.dispatchEvent(new Event("taxdibo:unauthorized"));
  }

  if (!response.ok) {
    throw new ApiError(await parseErrorBody(response));
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function apiDownload(
  path: string,
): Promise<{ blob: Blob; filename: string; contentType: string }> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(buildUrl(path), { headers });

  if (response.status === 401) {
    clearSession();
    window.dispatchEvent(new Event("taxdibo:unauthorized"));
  }

  if (!response.ok) {
    throw new ApiError(await parseErrorBody(response));
  }

  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const contentType = response.headers.get("Content-Type") ?? "application/octet-stream";

  return { blob: await response.blob(), filename: match?.[1] ?? "download", contentType };
}
