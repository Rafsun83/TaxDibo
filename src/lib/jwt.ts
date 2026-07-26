interface JwtPayload {
  sub?: string;
  userId?: number;
  role?: string;
  exp?: number;
}

// Decodes the payload only, for UI role display — the backend is the actual
// authority on authorization, this never verifies the signature.
export function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
