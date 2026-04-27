"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const SESSION_KEY = "stellarinsure-session";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export interface UserSession {
  userId: string;
  walletAddress: string | null;
  displayName: string | null;
}

export interface AuthContextValue {
  status: SessionStatus;
  session: UserSession | null;
  isAuthenticated: boolean;
  signIn(session: UserSession): void;
  signOut(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      setStatus("unauthenticated");
      return;
    }
    try {
      const raw = window.sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        setSession(JSON.parse(raw) as UserSession);
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
    } catch {
      setStatus("unauthenticated");
    }
  }, []);

  function signIn(newSession: UserSession) {
    setSession(newSession);
    setStatus("authenticated");
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    }
  }

  function signOut() {
    setSession(null);
    setStatus("unauthenticated");
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(SESSION_KEY);
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      isAuthenticated: status === "authenticated",
      signIn,
      signOut,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
