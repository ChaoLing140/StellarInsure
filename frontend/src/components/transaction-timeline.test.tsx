import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TransactionTimeline, DEFAULT_TX_STEPS, type TimelineStep } from "./transaction-timeline";

describe("TransactionTimeline", () => {
  it("renders all default steps", () => {
    render(<TransactionTimeline steps={DEFAULT_TX_STEPS} />);

    expect(screen.getByText("Wallet Signature")).toBeInTheDocument();
    expect(screen.getByText("Transaction Submission")).toBeInTheDocument();
    expect(screen.getByText("Chain Confirmation")).toBeInTheDocument();
  });

  it("displays correct status labels for each step state", () => {
    const steps: TimelineStep[] = [
      { ...DEFAULT_TX_STEPS[0], status: "completed" },
      { ...DEFAULT_TX_STEPS[1], status: "active" },
      { ...DEFAULT_TX_STEPS[2], status: "pending" },
    ];

    render(<TransactionTimeline steps={steps} />);

    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Waiting")).toBeInTheDocument();
  });

  it("renders a failed step correctly", () => {
    const steps: TimelineStep[] = [
      { ...DEFAULT_TX_STEPS[0], status: "completed" },
      { ...DEFAULT_TX_STEPS[1], status: "failed" },
      { ...DEFAULT_TX_STEPS[2], status: "pending" },
    ];

    render(<TransactionTimeline steps={steps} />);

    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("has an accessible label on the list", () => {
    render(<TransactionTimeline steps={DEFAULT_TX_STEPS} />);

    expect(screen.getByRole("list", { name: "Transaction progress" })).toBeInTheDocument();
  });
});
