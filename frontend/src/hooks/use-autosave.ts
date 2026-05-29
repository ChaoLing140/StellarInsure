"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 500;

export function useAutosave<T>(key: string, initial: T): [T, (next: T) => void, () => void, boolean] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch {
      // Corrupted data, fall back to initial
    }
    return initial;
  });

  const [isSaved, setIsSaved] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsSaved(false);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
        setIsSaved(true);
      } catch {
        // Storage full or unavailable, silently ignore
        setIsSaved(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [key, state]);

  const clear = useCallback(() => {
    setState(initial);
    setIsSaved(true);
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently ignore
    }
  }, [key, initial]);

  return [state, setState, clear, isSaved];
}
