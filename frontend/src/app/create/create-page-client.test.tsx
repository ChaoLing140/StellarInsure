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
    value = "",
    onChange,
  }: {
    value?: string;
    onChange: (value: string) => void;
  }) => (
    <input
      aria-label="Trigger mock input"
      onChange={(event) => onChange(event.target.value)}
      placeholder="Trigger mock input"
      type="text"
      value={value}
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

function makeTestStorage() {
  let store: Record<string, string> = {};

  return {
    clear: vi.fn(() => {
      store = {};
    }),
    getItem: vi.fn((key: string) => store[key] ?? null),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
  };
}

const testStorage = makeTestStorage();

function renderCreatePolicyPage() {
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
    testStorage.clear();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: testStorage,
    });
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: testStorage,
    });
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    testStorage.clear();
  });

  it("moves from policy type selection into configure step", () => {
    renderCreatePolicyPage();
    fireEvent.click(screen.getByRole("radio", { name: /weather protection/i }));

    expect(screen.getByRole("heading", { name: /configure your policy/i })).toBeInTheDocument();
  });

  it("applies form validation for invalid coverage values", () => {
    renderCreatePolicyPage();
    fireEvent.click(screen.getByRole("radio", { name: /weather protection/i }));

    const coverageInput = screen.getByLabelText(/coverage amount/i);
    fireEvent.change(coverageInput, { target: { value: "1000001" } });
    fireEvent.blur(coverageInput);

    expect(screen.getByText(/coverage amount cannot exceed 1,000,000.00 xlm/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue to review/i })).toBeDisabled();
  });

  it("restores trigger condition into the builder and keeps autosave working", () => {
    testStorage.setItem(
      "stellarinsure-policy-draft",
      JSON.stringify({
        policyType: "weather",
        coverageAmount: "",
        premium: "",
        triggerCondition: "rainfall > 50",
        duration: "",
        oracleProvider: "",
      }),
    );
    renderCreatePolicyPage();

    expect(screen.getByRole("heading", { name: /configure your policy/i })).toBeInTheDocument();

    const triggerInput = screen.getByLabelText(/trigger mock input/i);
    expect(triggerInput).toHaveValue("rainfall > 50");

    fireEvent.change(triggerInput, { target: { value: "rainfall > 60" } });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(JSON.parse(testStorage.getItem("stellarinsure-policy-draft") ?? "{}")).toMatchObject({
      triggerCondition: "rainfall > 60",
    });
  });

  it("submits successfully with mocked wallet signature", async () => {
    testStorage.setItem(
      "stellarinsure-policy-draft",
      JSON.stringify({
        policyType: "weather",
        coverageAmount: "5000",
        premium: "120",
        triggerCondition: "rainfall > 50",
        duration: "90",
        oracleProvider: "weatherlink-prime",
      }),
    );
    renderCreatePolicyPage();

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
});
