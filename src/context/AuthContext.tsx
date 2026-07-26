import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import * as authApi from "../lib/api/auth";
import { clearSession, getToken, storeSession } from "../lib/api/client";
import type { AuthUser, LoginPayload, RegisterPayload } from "../lib/api/types";
import { decodeJwtPayload } from "../lib/jwt";

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isAdmin: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  const raw = window.localStorage.getItem("taxdibo-user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener("taxdibo:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("taxdibo:unauthorized", handleUnauthorized);
  }, []);

  const isAdmin = useMemo(() => {
    if (!token) return false;
    return decodeJwtPayload(token)?.role === "ADMIN";
  }, [token]);

  const login = async (payload: LoginPayload) => {
    const res = await authApi.login(payload);
    storeSession(res.accessToken, res.user);
    setToken(res.accessToken);
    setUser(res.user);
  };

  const register = async (payload: RegisterPayload) => {
    const res = await authApi.register(payload);
    storeSession(res.accessToken, res.user);
    setToken(res.accessToken);
    setUser(res.user);
  };

  const logout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
