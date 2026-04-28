import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ErrorBoundary } from "./error-boundary";

vi.mock("@/lib/error-logger", () => ({
  logError: vi.fn(),
}));

// Component that throws an error for testing
const ThrowingComponent = () => {
  throw new Error("Test error");
};

// Component that renders normally
const WorkingComponent = () => {
  return <div>Working Component</div>;
};

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // Suppress console errors during testing
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Working Component")).toBeInTheDocument();
  });

  it("renders fallback UI when an error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Oops! Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(
        "We encountered an unexpected error. Our team has been notified, and we're working to fix it."
      )
    ).toBeInTheDocument();
  });

  it("displays error details in a collapsible section", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    const summary = screen.getByText("Error details");
    expect(summary).toBeInTheDocument();

    fireEvent.click(summary);
    expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();
  });

  it("renders a retry button", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    const button = screen.getByRole("button", { name: "Try Again" });
    expect(button).toBeInTheDocument();
  });

  it("allows retry to reset the error state", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Oops! Something went wrong")).toBeInTheDocument();

    const button = screen.getByRole("button", { name: "Try Again" });
    fireEvent.click(button);

    rerender(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Working Component")).toBeInTheDocument();
  });

  it("delegates error to the logger adapter", async () => {
    const { logError } = await import("@/lib/error-logger");

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(logError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.anything() }),
    );
  });
});
