import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LanguageProvider } from "@/i18n/provider";
import PoliciesListPageClient from "./policies-list-page-client";

function renderWithProviders(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe("PoliciesListPageClient", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("defaults to grid view on first visit", () => {
    renderWithProviders(<PoliciesListPageClient />);
    expect(screen.getByRole("button", { name: /grid view/i })).toHaveClass("active");
  });

  it("restores table view mode from localStorage on mount", async () => {
    localStorage.setItem("policy-view-mode", "table");
    renderWithProviders(<PoliciesListPageClient />);
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByRole("button", { name: /table view/i })).toHaveClass("active");
  });

  it("persists grid view selection to localStorage", () => {
    localStorage.setItem("policy-view-mode", "table");
    renderWithProviders(<PoliciesListPageClient />);
    act(() => {
      vi.runAllTimers();
    });
    fireEvent.click(screen.getByRole("button", { name: /grid view/i }));
    expect(localStorage.getItem("policy-view-mode")).toBe("grid");
  });

  it("persists table view selection to localStorage", () => {
    renderWithProviders(<PoliciesListPageClient />);
    fireEvent.click(screen.getByRole("button", { name: /table view/i }));
    expect(localStorage.getItem("policy-view-mode")).toBe("table");
  });

  it("shows policy result count after loading", () => {
    renderWithProviders(<PoliciesListPageClient />);
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.getByText(/policies found/i)).toBeInTheDocument();
  });

  it("result count updates when filters change", () => {
    renderWithProviders(<PoliciesListPageClient />);
    act(() => {
      vi.advanceTimersByTime(700);
    });
    const initialCount = screen.getByText(/policies found/i).textContent;
    fireEvent.change(screen.getByLabelText(/status/i), { target: { value: "active" } });
    act(() => {
      vi.runAllTimers();
    });
    const updatedCount = screen.getByText(/policies found/i).textContent;
    expect(updatedCount).not.toBe(initialCount);
  });
});
