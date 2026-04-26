import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { ThemeProvider } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";

function renderWithProvider() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    localStorage.clear();
    // Default to no system preference (light)
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it("renders a button with an accessible label", () => {
    renderWithProvider();
    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-label");
  });

  it("shows 'Switch to dark mode' when the current theme is light", () => {
    renderWithProvider();
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Switch to dark mode",
    );
  });

  it("toggles the aria-label to 'Switch to light mode' after clicking", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Switch to light mode",
    );
  });

  it("applies data-theme='dark' on <html> after toggling to dark", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole("button"));

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("persists the chosen theme in localStorage", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole("button"));

    expect(localStorage.getItem("stellarinsure-theme")).toBe("dark");
  });

  it("restores the stored preference on mount", () => {
    localStorage.setItem("stellarinsure-theme", "dark");

    renderWithProvider();

    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Switch to light mode",
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("respects system preference when no stored value exists", () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    renderWithProvider();

    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Switch to light mode",
    );
  });
});
