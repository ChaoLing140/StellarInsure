import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "stellarinsure-theme";

function getSystemPreference(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;

  return getSystemPreference();
}

/**
 * Manages the application colour scheme (light / dark).
 *
 * - Reads the stored preference from `localStorage` on mount.
 * - Falls back to the OS-level `prefers-color-scheme` media query when no
 *   stored preference exists.
 * - Persists every manual toggle back to `localStorage`.
 * - Keeps the `data-theme` attribute on `<html>` in sync so CSS variable
 *   overrides fire without any prop drilling.
 * - Listens for OS preference changes and applies them only when the user
 *   has not made an explicit manual choice.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [isExplicit, setIsExplicit] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) !== null;
  });

  // Apply the theme attribute to <html> whenever the resolved theme changes.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Watch for OS-level preference changes and honour them when the user
  // hasn't made a manual choice.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (event: MediaQueryListEvent) => {
      if (!isExplicit) {
        setThemeState(event.matches ? "dark" : "light");
      }
    };

    if (mq.addEventListener) {
      mq.addEventListener("change", handleChange);
    } else {
      mq.addListener(handleChange);
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener("change", handleChange);
      } else {
        mq.removeListener(handleChange);
      }
    };
  }, [isExplicit]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    setIsExplicit(true);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}
