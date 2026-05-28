import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CreatePolicyPageClient from "./create-page-client";
import { LanguageProvider } from "@/i18n/provider";

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
  TriggerConditionBuilder: ({ onChange }: { onChange: (value: string) => void }) => (
    <input
      aria-label="Trigger mock input"
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

function renderCreatePage() {
  return render(
    <LanguageProvider>
      <CreatePolicyPageClient />
    </LanguageProvider>,
  );
}

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
  };
}

describe("CreatePolicyPageClient", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const storage = createMemoryStorage();
    Object.defineProperty(window, "localStorage", {
      value: storage,
      configurable: true,
    });
    Object.defineProperty(globalThis, "localStorage", {
      value: storage,
      configurable: true,
    });
    signTransactionMock.mockReset();
    signTransactionMock.mockResolvedValue({ signedTxXdr: "signed-xdr" });
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    cleanup();
  });

  it("moves from policy type selection into configure step", () => {
    renderCreatePage();
    fireEvent.click(screen.getByRole("radio", { name: /weather protection/i }));

    expect(screen.getByRole("heading", { name: /configure your policy/i })).toBeInTheDocument();
  });

  it("applies form validation for invalid coverage values", () => {
    renderCreatePage();
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
        policyType: "weather",
        coverageAmount: "5000",
        premium: "120",
        triggerCondition: "rainfall > 50",
        duration: "90",
        oracleProvider: "weatherlink-prime",
      }),
    );
    renderCreatePage();

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

  it("keeps the draft available after a failed wallet signature", async () => {
    signTransactionMock.mockRejectedValueOnce(new Error("User declined signature"));
    localStorage.setItem(
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
    renderCreatePage();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /sign and submit/i }));
    });

    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText(/policy submission needs attention/i)).toBeInTheDocument();
    expect(screen.getByText(/user declined signature/i)).toBeInTheDocument();
    expect(screen.getByText(/your draft is still saved/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /back to review/i }));

    expect(screen.getByRole("heading", { name: /review your policy/i })).toBeInTheDocument();
    expect(screen.getByText("rainfall > 50")).toBeInTheDocument();
  });

  it("retries submission after a failed wallet signature", async () => {
    signTransactionMock
      .mockRejectedValueOnce(new Error("User declined signature"))
      .mockResolvedValueOnce({ signedTxXdr: "signed-xdr" });
    localStorage.setItem(
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
    renderCreatePage();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /sign and submit/i }));
    });
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /retry signature/i }));
    });
    expect(signTransactionMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(screen.getByText(/policy created successfully/i)).toBeInTheDocument();
  });
});
