import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LanguageProvider } from "@/i18n/provider";

import CreatePolicyPageClient from "./create-page-client";

vi.mock("@/components/wallet-provider", () => ({
  useWallet: () => ({
    isConnected: true,
    message: "Wallet connected.",
    status: "connected",
  }),
}));

const signTransactionMock = vi.fn();
vi.mock("@stellar/freighter-api", () => ({
  signTransaction: (...args: unknown[]) => signTransactionMock(...args),
}));

vi.mock("@/components/trigger-condition-builder", () => ({
  TriggerConditionBuilder: ({
    initialRules,
    onChange,
  }: {
    initialRules?: { field: string; operator: string; value: string }[];
    onChange: (value: string) => void;
  }) => (
    <input
      aria-label="Trigger mock input"
      defaultValue={
        initialRules
          ? initialRules.map((r) => `${r.field} ${r.operator} ${r.value}`).join(" AND ")
          : ""
      }
      onChange={(event) => onChange(event.target.value)}
      placeholder="Trigger mock input"
      type="text"
    />
  ),
}));

vi.mock("@/components/oracle-source-selector", () => ({
  OracleSourceSelector: ({
    state,
    selectedId,
    onSelect,
  }: {
    state: string;
    selectedId: string | null;
    onSelect: (providerId: string) => void;
  }) =>
    state === "ready" ? (
      <label>
        <input
          checked={selectedId === "weatherlink-prime"}
          name="oracle-provider"
          onChange={() => onSelect("weatherlink-prime")}
          type="radio"
        />
        WeatherLink Prime
      </label>
    ) : (
      <p>Loading oracle providers...</p>
  ),
}));

function renderCreatePolicyPageClient() {
  return render(
    <LanguageProvider>
      <CreatePolicyPageClient />
    </LanguageProvider>,
  );
}

describe("CreatePolicyPageClient", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    signTransactionMock.mockResolvedValue({ signedTxXdr: "signed-xdr" });
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("moves from policy type selection into configure step", () => {
    renderCreatePolicyPageClient();
    fireEvent.click(screen.getByRole("radio", { name: /weather protection/i }));

    expect(screen.getByRole("heading", { name: /configure your policy/i })).toBeInTheDocument();
  });

  it("applies form validation for invalid coverage values", () => {
    renderCreatePolicyPageClient();
    fireEvent.click(screen.getByRole("radio", { name: /weather protection/i }));

    const coverageInput = screen.getByLabelText(/coverage amount/i);
    fireEvent.change(coverageInput, { target: { value: "1000001" } });
    fireEvent.blur(coverageInput);

    expect(screen.getByText(/coverage amount cannot exceed 1,000,000.00 xlm/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue to review/i })).toBeDisabled();
  });

  it("submits successfully with mocked wallet signature", async () => {
    localStorage.setItem(
      "stellarinsure-policy-draft",
      JSON.stringify({
        data: {
          policyType: "weather",
          coverageAmount: "5000",
          premium: "120",
          triggerCondition: "rainfall > 50",
          duration: "90",
          oracleProvider: "weatherlink-prime",
        },
        updatedAt: Date.now(),
      }),
    );
    renderCreatePolicyPageClient();

    expect(screen.getByRole("heading", { name: /review your policy/i })).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /sign and submit/i }));
    });
    expect(signTransactionMock).toHaveBeenCalled();

    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(screen.getByText(/policy created successfully/i)).toBeInTheDocument();
  });

  it("restores trigger condition builder rules from draft when going back to configure step", () => {
    localStorage.setItem(
      "stellarinsure-policy-draft",
      JSON.stringify({
        data: {
          policyType: "weather",
          coverageAmount: "5000",
          premium: "120",
          triggerCondition: "temperature > 25 AND rainfall > 50",
          duration: "90",
          oracleProvider: "weatherlink-prime",
        },
        updatedAt: Date.now(),
      }),
    );
    renderCreatePolicyPageClient();

    expect(screen.getByRole("heading", { name: /review your policy/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /back/i }));

    expect(screen.getByRole("heading", { name: /configure your policy/i })).toBeInTheDocument();

    const triggerInput = screen.getByPlaceholderText("Trigger mock input") as HTMLInputElement;
    expect(triggerInput.value).toBe("temperature > 25 AND rainfall > 50");
  });

  it("lets users undo an explicit draft discard", () => {
    const savedDraft = {
      policyType: "weather",
      coverageAmount: "5000",
      premium: "120",
      triggerCondition: "rainfall > 50",
      duration: "90",
      oracleProvider: "weatherlink-prime",
    };
    localStorage.setItem(
      "stellarinsure-policy-draft",
      JSON.stringify({ data: savedDraft, updatedAt: 1000 }),
    );

    renderCreatePolicyPageClient();

    expect(screen.getByRole("heading", { name: /review your policy/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /discard/i }));

    expect(screen.getByText(/draft discarded/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /choose a policy type/i })).toBeInTheDocument();
    expect(localStorage.getItem("stellarinsure-policy-draft")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /undo discard/i }));

    expect(screen.getByRole("heading", { name: /review your policy/i })).toBeInTheDocument();
    expect(screen.getByText(/rainfall > 50/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(JSON.parse(localStorage.getItem("stellarinsure-policy-draft") ?? "{}").data).toEqual(savedDraft);
  });
});
