import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  AmountInput,
  formatAssetAmount,
  normalizeAmountInput,
  parseAmountInput,
} from "./amount-input";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { OnboardingFlow } from "./onboarding";
import { OracleSourceSelector } from "./oracle-source-selector";
import { PageTransition } from "./page-transition";
import { PremiumEstimate } from "./premium-estimate";
import { Skeleton, SkeletonText } from "./skeleton";
import { StructuredData } from "./structured-data";
import { TransactionModal } from "./transaction-modal";
import { TriggerConditionBuilder } from "./trigger-condition-builder";
import { ValidationSummary } from "./validation-summary";
import { WalletConnectionButton } from "./wallet-connection-button";
import { WalletProvider } from "./wallet-provider";

vi.mock("next/link", () => ({
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/policies/weather-alpha",
}));

vi.mock("@/i18n/provider", () => ({
  useAppTranslation: () => ({
    t: (key: string) =>
      (
        {
          "nav.label": "Primary navigation",
          "nav.overview": "Overview",
          "nav.policies": "Policies",
          "nav.history": "History",
        } as Record<string, string>
      )[key] ?? key,
  }),
}));

const storage: Record<string, string> = {};
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    },
  },
  configurable: true,
});

describe("wallet components", () => {
  it("connects and disconnects using the wallet button", async () => {
    (window as any).freighterApi = { requestAccess: vi.fn().mockResolvedValue("GAAAAABBBBBCCCCCDDDDDEEEEEFFFFGGGGHHHHIIIIJJJJKKKKLLLLMMMM") };
    render(
      <WalletProvider>
        <WalletConnectionButton />
      </WalletProvider>,
    );

    const connectButton = await screen.findByRole("button", {
      name: /connect wallet/i,
    });
    fireEvent.click(connectButton);
    expect(await screen.findByText(/wallet connected/i)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /disconnect gaaaaa/i }),
    );
    expect(screen.getByText(/wallet disconnected/i)).toBeInTheDocument();
  });
});

describe("oracle and trigger controls", () => {
  it("renders oracle cards and updates selected provider", () => {
    const onSelect = vi.fn();
    render(
      <OracleSourceSelector
        state="ready"
        selectedId="p1"
        onSelect={onSelect}
        providers={[
          { id: "p1", name: "ChainFeed", network: "Stellar", confidence: 95, latency: "120ms", fallbackTo: "BackupFeed" },
          { id: "p2", name: "BackupFeed", network: "Stellar", confidence: 78, latency: "220ms" },
        ]}
      />,
    );
    fireEvent.click(screen.getAllByRole("radio")[1]);
    expect(onSelect).toHaveBeenCalledWith("p2");
  });

  it("builds trigger condition strings on rule changes", () => {
    const onChange = vi.fn();
    render(<TriggerConditionBuilder onChange={onChange} />);
    const valueInput = screen.getByPlaceholderText(/value/i);
    fireEvent.change(valueInput, { target: { value: "120" } });
    expect(onChange).toHaveBeenCalledWith("temperature > 120");
  });

  it("hydrates trigger condition strings into visible rules", () => {
    const onChange = vi.fn();
    render(<TriggerConditionBuilder value="rainfall >= 50" onChange={onChange} />);
    const [fieldSelect, operatorSelect] = screen.getAllByRole("combobox");

    expect(fieldSelect).toHaveValue("rainfall");
    expect(operatorSelect).toHaveValue(">=");
    expect(screen.getByDisplayValue("50")).toBeInTheDocument();
    expect(screen.getByText("rainfall >= 50")).toBeInTheDocument();
  });
});

describe("premium, validation, transaction and amount input", () => {
  it("supports premium estimate retries and breakdown", () => {
    const onRecalculate = vi.fn();
    render(
      <PremiumEstimate
        totalAmount="125.00"
        currency="XLM"
        onRecalculate={onRecalculate}
        breakdown={[{ label: "Risk", amount: "100", unit: "XLM" }]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /recalculate/i }));
    expect(onRecalculate).toHaveBeenCalled();
    expect(screen.getByText(/risk/i)).toBeInTheDocument();
  });

  it("jumps to field from validation summary", () => {
    const target = document.createElement("input");
    target.id = "email";
    target.focus = vi.fn();
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    render(
      <ValidationSummary
        errors={[{ id: "email", field: "Email", message: "Required" }]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /email: required/i }));
    expect(target.focus).toHaveBeenCalled();
  });

  it("shows modal success after confirming transaction", async () => {
    const onClose = vi.fn();
    render(
      <TransactionModal
        isOpen
        onClose={onClose}
        type="premium"
        amount={50}
        destination="GDEST"
        onConfirm={async () => undefined}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /confirm & sign/i }));
    expect(await screen.findByText(/transaction complete/i)).toBeInTheDocument();
  });

  it("formats and parses amount values", () => {
    expect(normalizeAmountInput("12345.678")).toBe("12,345.67");
    expect(parseAmountInput("12,345.67")).toBe(12345.67);
    expect(formatAssetAmount(23)).toBe("23.00");
  });

  it("emits normalized values from amount input", () => {
    const onChange = vi.fn();
    render(<AmountInput value="" onChange={onChange} aria-label="Amount" />);
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: "10000" },
    });
    expect(onChange).toHaveBeenCalledWith("10,000");
  });
});

describe("mobile and utility components", () => {
  it("renders mobile bottom navigation and active state", () => {
    render(<MobileBottomNav />);
    expect(screen.getByLabelText(/primary navigation/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /policies/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders onboarding flow and advances step", () => {
    localStorage.removeItem("stellarinsure-onboarded");
    render(<OnboardingFlow />);
    fireEvent.click(
      screen.getByRole("tab", {
        name: /step 2: connect your stellar wallet/i,
      }),
    );
    expect(
      screen.getByRole("heading", { name: /connect your stellar wallet/i }),
    ).toBeInTheDocument();
  });

  it("renders skeleton, page transition, and structured data", () => {
    const { container } = render(
      <>
        <Skeleton />
        <SkeletonText lines={2} />
        <PageTransition>
          <div>Page body</div>
        </PageTransition>
        <StructuredData data={{ "@type": "WebSite", name: "StellarInsure" }} />
      </>,
    );
    expect(container.querySelector(".ob-skeleton")).toBeTruthy();
    expect(screen.getByText(/page body/i)).toBeInTheDocument();
    expect(container.querySelector('script[type="application/ld+json"]')).toBeTruthy();
  });
});
