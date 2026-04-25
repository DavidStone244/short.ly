"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "shortly_token";

interface AuthState {
  token: string | null;
  email: string | null;
}

interface AuthContextValue extends AuthState {
  login: (token: string, email: string) => void;
  logout: () => void;
  ready: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface StoredAuth {
  token: string;
  email: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: null, email: null });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredAuth;
        setState({ token: parsed.token, email: parsed.email });
      }
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  const login = useCallback((token: string, email: string) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, email }));
    setState({ token, email });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ token: null, email: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
