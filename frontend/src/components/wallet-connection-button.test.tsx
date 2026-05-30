import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WalletConnectionButton } from "./wallet-connection-button";
import { WalletProvider } from "./wallet-provider";

function renderWalletButton() {
  return render(
    <WalletProvider>
      <WalletConnectionButton />
    </WalletProvider>,
  );
}

describe("WalletConnectionButton", () => {
  beforeEach(() => {
    localStorage.clear();
    delete (window as { freighterApi?: unknown }).freighterApi;
  });

  it("renders a retry action after a rejected wallet request", async () => {
    (window as { freighterApi?: { requestAccess: () => Promise<never> } }).freighterApi = {
      requestAccess: vi.fn().mockRejectedValue(new Error("User rejected access")),
    };

    renderWalletButton();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /connect wallet/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /connect wallet/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/wallet request was declined/i),
      ).toBeInTheDocument();
    });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");

    const retryButton = screen.getByRole("button", { name: /retry wallet connection/i });
    expect(retryButton).toBeInTheDocument();

    (window as { freighterApi?: { requestAccess: () => Promise<string> } }).freighterApi = {
      requestAccess: vi.fn().mockResolvedValue("GCFX7VQ7VONM4ANPSRLJQ3Q6KXG3MNN5J4F7B3MFK7TR2Q7UDLX2M3TA"),
    };

    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText(/wallet connected/i)).toBeInTheDocument();
    });
  });
});
