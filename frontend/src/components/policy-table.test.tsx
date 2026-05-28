import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PolicyTable, type Policy } from "./policy-table";

const MOCK_POLICIES: Policy[] = [
  {
    id: "policy-b",
    title: "Policy B",
    type: "weather",
    status: "active",
    coverageAmount: 5000,
    premiumAmount: 125.5,
    createdAt: "2026-02-15",
    expiresAt: "2026-06-01",
    oracleSource: "NOAA",
  },
  {
    id: "policy-a",
    title: "Policy A",
    type: "flight",
    status: "pending",
    coverageAmount: 2000,
    premiumAmount: 45.0,
    createdAt: "2026-03-01",
    expiresAt: "2026-05-01",
    oracleSource: "Airline API",
  },
];

describe("PolicyTable", () => {
  it("renders an empty state when no policies are provided", () => {
    render(<PolicyTable policies={[]} />);
    expect(screen.getByText("No policies found.")).toBeInTheDocument();
  });

  it("renders policy rows", () => {
    render(<PolicyTable policies={MOCK_POLICIES} />);
    expect(screen.getByText("policy-b")).toBeInTheDocument();
    expect(screen.getByText("policy-a")).toBeInTheDocument();
  });

  it("sort button aria-label reflects unsorted state", () => {
    render(<PolicyTable policies={MOCK_POLICIES} />);
    expect(
      screen.getByRole("button", { name: /sort by premium/i }),
    ).toBeInTheDocument();
  });

  it("sort button aria-label updates after toggling sort on a column", () => {
    render(<PolicyTable policies={MOCK_POLICIES} />);
    const coverageBtn = screen.getByRole("button", { name: /sort by coverage/i });
    fireEvent.click(coverageBtn);
    expect(
      screen.getByRole("button", { name: /coverage, sorted ascending\. click to sort descending/i }),
    ).toBeInTheDocument();
  });

  it("toggles sort order and updates aria-label on second click", () => {
    render(<PolicyTable policies={MOCK_POLICIES} />);
    const premiumBtn = screen.getByRole("button", { name: /sort by premium/i });
    fireEvent.click(premiumBtn);
    fireEvent.click(premiumBtn);
    expect(
      screen.getByRole("button", { name: /premium, sorted descending\. click to sort ascending/i }),
    ).toBeInTheDocument();
  });

  it("sorts policies by coverage ascending when coverage column is clicked", () => {
    render(<PolicyTable policies={MOCK_POLICIES} />);
    fireEvent.click(screen.getByRole("button", { name: /sort by coverage/i }));
    const rows = screen.getAllByRole("row").slice(1);
    const amounts = rows.map((r) => r.querySelector("td:nth-child(3)")?.textContent);
    expect(amounts[0]).toContain("2000");
    expect(amounts[1]).toContain("5000");
  });

  it("sorts policies by coverage descending on second click", () => {
    render(<PolicyTable policies={MOCK_POLICIES} />);
    const btn = screen.getByRole("button", { name: /sort by coverage/i });
    fireEvent.click(btn);
    fireEvent.click(btn);
    const rows = screen.getAllByRole("row").slice(1);
    const amounts = rows.map((r) => r.querySelector("td:nth-child(3)")?.textContent);
    expect(amounts[0]).toContain("5000");
    expect(amounts[1]).toContain("2000");
  });
});
