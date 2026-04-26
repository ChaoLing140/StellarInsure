"use client";

import React, {
  createContext,
  type ReactNode,
  useContext,
} from "react";

import { type Theme, useTheme } from "@/hooks/use-theme";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Provides theme state (light / dark) to the component tree.
 *
 * Place this near the top of the application — inside the root layout — so
 * every page and component can read or change the active theme without prop
 * drilling.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeValue = useTheme();

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Returns the current theme context.
 *
 * @throws {Error} When called outside of a `ThemeProvider`.
 */
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used inside ThemeProvider");
  }
  return context;
}
