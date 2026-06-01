"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type ToastStatus = "pending" | "success" | "failure";

export interface Toast {
  id: string;
  message: string;
  status: ToastStatus;
}

interface ToastQueueContextValue {
  enqueue: (message: string, status: ToastStatus) => string;
  dismiss: (id: string) => void;
  toasts: Toast[];
}

const ToastQueueContext = createContext<ToastQueueContextValue | null>(null);

const STATUS_LABELS: Record<ToastStatus, string> = {
  pending: "Pending",
  success: "Success",
  failure: "Failed",
};

const AUTO_DISMISS_MS = 5000;

let _counter = 0;
function nextId() {
  return `toast-${++_counter}`;
}

export function TransactionToastQueueProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const enqueue = useCallback(
    (message: string, status: ToastStatus): string => {
      const id = nextId();
      setToasts((prev) => [...prev, { id, message, status }]);
      if (status !== "pending") {
        const timer = setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss]
  );

  // Clean up timers on unmount
  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((timer) => clearTimeout(timer));
  }, []);

  return (
    <ToastQueueContext.Provider value={{ enqueue, dismiss, toasts }}>
      {children}
      <TransactionToastQueue />
    </ToastQueueContext.Provider>
  );
}

export function useToastQueue(): ToastQueueContextValue {
  const ctx = useContext(ToastQueueContext);
  if (!ctx) throw new Error("useToastQueue must be used within TransactionToastQueueProvider");
  return ctx;
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Move focus to dismiss button when toast appears
  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-status={toast.status}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
        padding: "0.75rem 1rem",
        borderRadius: "0.5rem",
        marginBottom: "0.5rem",
        background:
          toast.status === "success"
            ? "var(--color-success-bg, #d1fae5)"
            : toast.status === "failure"
            ? "var(--color-error-bg, #fee2e2)"
            : "var(--color-pending-bg, #fef9c3)",
        border: `1px solid ${
          toast.status === "success"
            ? "var(--color-success-border, #6ee7b7)"
            : toast.status === "failure"
            ? "var(--color-error-border, #fca5a5)"
            : "var(--color-pending-border, #fde68a)"
        }`,
        color: "var(--color-text, #111)",
        minWidth: "260px",
        maxWidth: "420px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      }}
    >
      <span>
        <strong aria-label={`Status: ${STATUS_LABELS[toast.status]}`}>
          [{STATUS_LABELS[toast.status]}]
        </strong>{" "}
        {toast.message}
      </span>
      <button
        ref={buttonRef}
        onClick={() => onDismiss(toast.id)}
        aria-label={`Dismiss notification: ${toast.message}`}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "1rem",
          lineHeight: 1,
          padding: "0.25rem",
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}

export function TransactionToastQueue() {
  const ctx = useContext(ToastQueueContext);
  if (!ctx || ctx.toasts.length === 0) return null;

  return (
    <div
      aria-label="Transaction notifications"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {ctx.toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={ctx.dismiss} />
      ))}
    </div>
  );
}
