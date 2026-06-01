import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClaimHistoryList, type ClaimHistoryItem } from "./claim-history-list";
import { mockRouter, setMockSearchParams } from "@/test/mocks/next-navigation";

describe("ClaimHistoryList", () => {
  beforeEach(() => {
    setMockSearchParams("");
    vi.restoreAllMocks();
  });

  const mockClaims: ClaimHistoryItem[] = [
    {
      id: "CLM-0091",
      policyId: "weather-alpha",
      policyTitle: "Northern Plains Weather Guard",
      amount: 4500,
      status: "approved",
      submittedAt: "2026-03-18T14:30:00.000Z",
      updatedAt: "2026-03-20T10:15:00.000Z",
      evidence: "Rainfall station export and oracle verification bundle",
    },
    {
      id: "CLM-0092",
      policyId: "flight-orbit",
      policyTitle: "Flight Orbit Delay Cover",
      amount: 800,
      status: "pending",
      submittedAt: "2026-03-22T09:00:00.000Z",
      evidence: "Flight delay documentation",
    },
    {
      id: "CLM-0093",
      policyId: "weather-alpha",
      policyTitle: "Northern Plains Weather Guard",
      amount: 2000,
      status: "rejected",
      submittedAt: "2026-03-15T11:20:00.000Z",
      updatedAt: "2026-03-16T14:30:00.000Z",
    },
  ];

  it("renders claim history title", () => {
    render(<ClaimHistoryList claims={mockClaims} />);
    expect(screen.getByText("Claim History")).toBeInTheDocument();
  });

  it("renders all claims", () => {
    render(<ClaimHistoryList claims={mockClaims} />);
    expect(screen.getByText("CLM-0091")).toBeInTheDocument();
    expect(screen.getByText("CLM-0092")).toBeInTheDocument();
    expect(screen.getByText("CLM-0093")).toBeInTheDocument();
  });

  it("renders claim amounts", () => {
    render(<ClaimHistoryList claims={mockClaims} />);
    expect(screen.getByText(/4,500\.00/)).toBeInTheDocument();
    expect(screen.getByText(/800\.00/)).toBeInTheDocument();
    expect(screen.getByText(/2,000\.00/)).toBeInTheDocument();
  });

  it("renders claim statuses", () => {
    render(<ClaimHistoryList claims={mockClaims} />);
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });

  it("renders policy links", () => {
    render(<ClaimHistoryList claims={mockClaims} />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute("href", "/policies/weather-alpha");
  });

  it("renders submitted dates", () => {
    render(<ClaimHistoryList claims={mockClaims} />);
    expect(screen.getByText(/Mar 18, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Mar 22, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Mar 15, 2026/)).toBeInTheDocument();
  });

  it("renders updated dates when available", () => {
    render(<ClaimHistoryList claims={mockClaims} />);
    expect(screen.getByText(/Mar 20, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Mar 16, 2026/)).toBeInTheDocument();
  });

  it("renders evidence when available", () => {
    render(<ClaimHistoryList claims={mockClaims} />);
    expect(
      screen.getByText(
        "Rainfall station export and oracle verification bundle",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Flight delay documentation")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(<ClaimHistoryList claims={[]} isLoading={true} />);
    expect(
      screen.getByRole("list", { name: /loading claims/i }),
    ).toBeInTheDocument();
  });

  it("renders empty state when no claims", () => {
    render(<ClaimHistoryList claims={[]} />);
    expect(screen.getByText("No claims submitted yet")).toBeInTheDocument();
  });

  it("renders custom empty message", () => {
    render(
      <ClaimHistoryList claims={[]} emptyMessage="Custom empty message" />,
    );
    expect(screen.getByText("Custom empty message")).toBeInTheDocument();
  });

  it("renders sort buttons", () => {
    render(<ClaimHistoryList claims={mockClaims} />);
    expect(
      screen.getByRole("button", { name: /sort by date/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sort by amount/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sort by status/i }),
    ).toBeInTheDocument();
  });

  it("sorts by date in descending order by default", () => {
    render(<ClaimHistoryList claims={mockClaims} />);
    const claimIds = screen.getAllByText(/CLM-\d+/);
    expect(claimIds[0]).toHaveTextContent("CLM-0092"); // Most recent
  });

  it("toggles sort order when clicking date button", async () => {
    const user = userEvent.setup();
    render(<ClaimHistoryList claims={mockClaims} />);

    const dateButton = screen.getByRole("button", { name: /sort by date/i });
    await user.click(dateButton);

    const claimIds = screen.getAllByText(/CLM-\d+/);
    expect(claimIds[0]).toHaveTextContent("CLM-0093"); // Oldest
  });

  it("sorts by amount when clicking amount button", async () => {
    const user = userEvent.setup();
    render(<ClaimHistoryList claims={mockClaims} />);

    const amountButton = screen.getByRole("button", {
      name: /sort by amount/i,
    });
    await user.click(amountButton);

    const claimIds = screen.getAllByText(/CLM-\d+/);
    expect(claimIds[0]).toHaveTextContent("CLM-0091"); // Highest amount
  });

  it("sorts by status when clicking status button", async () => {
    const user = userEvent.setup();
    render(<ClaimHistoryList claims={mockClaims} />);

    const statusButton = screen.getByRole("button", {
      name: /sort by status/i,
    });
    await user.click(statusButton);

    // Status sort is alphabetical in descending order by default
    const statuses = screen.getAllByText(/Approved|Pending|Rejected/);
    expect(statuses[0]).toHaveTextContent("Rejected");
  });

  it("renders processing status correctly", () => {
    const processingClaim: ClaimHistoryItem = {
      ...mockClaims[0],
      status: "processing",
    };
    render(<ClaimHistoryList claims={[processingClaim]} />);
    expect(screen.getByText("Processing")).toBeInTheDocument();
  });

  it("filters claims by status toggles and writes the URL state", async () => {
    const user = userEvent.setup();
    const replaceSpy = vi.spyOn(mockRouter, "replace");
    const paidClaim: ClaimHistoryItem = {
      ...mockClaims[0],
      id: "CLM-0094",
      status: "paid",
    };

    render(<ClaimHistoryList claims={[...mockClaims, paidClaim]} />);

    await user.click(screen.getByRole("button", { name: "Pending" }));
    expect(screen.getByText("CLM-0092")).toBeInTheDocument();
    expect(screen.queryByText("CLM-0091")).not.toBeInTheDocument();
    expect(replaceSpy).toHaveBeenLastCalledWith("/?claimStatus=pending");

    await user.click(screen.getByRole("button", { name: "Paid" }));
    expect(screen.getByText("CLM-0092")).toBeInTheDocument();
    expect(screen.getByText("CLM-0094")).toBeInTheDocument();
    expect(replaceSpy).toHaveBeenLastCalledWith(
      "/?claimStatus=pending%2Cpaid",
    );
  });

  it("initializes filters from URL search params", () => {
    setMockSearchParams("claimStatus=rejected");
    render(<ClaimHistoryList claims={mockClaims} />);

    expect(screen.getByText("CLM-0093")).toBeInTheDocument();
    expect(screen.queryByText("CLM-0091")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rejected" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("explains active filters when no claims match", async () => {
    const user = userEvent.setup();
    render(<ClaimHistoryList claims={mockClaims} />);

    await user.click(screen.getByRole("button", { name: "Paid" }));

    expect(
      screen.getByText("No claims match the active filters: Paid."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /clear filters/i }),
    ).toBeInTheDocument();
  });

  it("formats large amounts correctly", () => {
    const largeClaim: ClaimHistoryItem = {
      ...mockClaims[0],
      amount: 1_234_567.89,
    };
    render(<ClaimHistoryList claims={[largeClaim]} />);
    expect(screen.getByText(/1,234,567\.89/)).toBeInTheDocument();
  });
});
