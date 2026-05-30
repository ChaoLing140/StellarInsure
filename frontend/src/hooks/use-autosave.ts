"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 500;

interface StoredDraft<T> {
  data: T;
  updatedAt: number;
}

function readStoredDraft<T>(key: string): StoredDraft<T> | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as StoredDraft<T> | T;
    if (parsed && typeof parsed === "object" && "data" in parsed && "updatedAt" in parsed) {
      return parsed as StoredDraft<T>;
    }

    return { data: parsed as T, updatedAt: 0 };
  } catch {
    return null;
  }
}

function writeStoredDraft<T>(key: string, data: T, updatedAt: number): void {
  const envelope: StoredDraft<T> = { data, updatedAt };
  localStorage.setItem(key, JSON.stringify(envelope));
}

export interface AutosaveControls<T> {
  state: T;
  setState: (next: T) => void;
  clear: () => void;
  restoreCleared: () => T | null;
  hasClearedBackup: boolean;
  isSaved: boolean;
}

export function useAutosave<T>(key: string, initial: T): [T, (next: T) => void, () => void, boolean] {
  const controls = usePolicyDraftAutosave(key, initial);
  return [controls.state, controls.setState, controls.clear, controls.isSaved];
}

export function usePolicyDraftAutosave<T>(key: string, initial: T): AutosaveControls<T> {
  const backupKey = `${key}-backup`;
  const editedAtRef = useRef(0);

  const [state, setStateInternal] = useState<T>(() => {
    const stored = readStoredDraft<T>(key);
    if (stored) {
      editedAtRef.current = stored.updatedAt;
      return stored.data;
    }
    return initial;
  });

  const [isSaved, setIsSaved] = useState(true);
  const [hasClearedBackup, setHasClearedBackup] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return localStorage.getItem(backupKey) !== null;
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setState = useCallback((next: T) => {
    editedAtRef.current = Date.now();
    setStateInternal(next);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setIsSaved(false);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      try {
        const updatedAt = editedAtRef.current || Date.now();
        writeStoredDraft(key, state, updatedAt);
        setIsSaved(true);
      } catch {
        setIsSaved(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [key, state]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function handleStorage(event: StorageEvent) {
      if (event.key !== key || !event.newValue) {
        return;
      }

      try {
        const stored = JSON.parse(event.newValue) as StoredDraft<T>;
        if (!stored || typeof stored !== "object" || !("data" in stored)) {
          return;
        }

        const storedUpdatedAt = stored.updatedAt ?? 0;
        if (storedUpdatedAt <= editedAtRef.current) {
          return;
        }

        editedAtRef.current = storedUpdatedAt;
        setStateInternal(stored.data);
      } catch {
        // Ignore corrupted cross-tab payloads.
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key]);

  const clear = useCallback(() => {
    try {
      const current = readStoredDraft<T>(key);
      if (current) {
        localStorage.setItem(backupKey, JSON.stringify(current));
        setHasClearedBackup(true);
      }
    } catch {
      // Ignore backup failures.
    }

    editedAtRef.current = Date.now();
    setStateInternal(initial);
    setIsSaved(true);

    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage failures.
    }
  }, [backupKey, initial, key]);

  const restoreCleared = useCallback((): T | null => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const backupRaw = localStorage.getItem(backupKey);
      if (!backupRaw) {
        return null;
      }

      const backup = JSON.parse(backupRaw) as StoredDraft<T>;
      const restoredAt = backup.updatedAt ?? Date.now();

      if (restoredAt <= editedAtRef.current) {
        return null;
      }

      editedAtRef.current = restoredAt;
      setStateInternal(backup.data);
      writeStoredDraft(key, backup.data, restoredAt);
      localStorage.removeItem(backupKey);
      setHasClearedBackup(false);
      setIsSaved(true);
      return backup.data;
    } catch {
      return null;
    }
  }, [backupKey, key]);

  return {
    state,
    setState,
    clear,
    restoreCleared,
    hasClearedBackup,
    isSaved,
  };
}

export function serializePolicyDraft<T>(data: T): string {
  return JSON.stringify({ data, updatedAt: Date.now() });
}

export function restorePolicyDraft<T>(raw: string, fallback: T): T {
  try {
    const parsed = JSON.parse(raw) as StoredDraft<T> | T;
    if (parsed && typeof parsed === "object" && "data" in parsed) {
      return (parsed as StoredDraft<T>).data;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}
