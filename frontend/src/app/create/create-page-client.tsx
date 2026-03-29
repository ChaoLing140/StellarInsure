"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { AmountInput, formatAssetAmount, parseAmountInput } from "@/components/amount-input";
import { Icon } from "@/components/icon";
import {
  OracleSourceSelector,
  type OracleProvider,
  type OracleProviderState,
} from "@/components/oracle-source-selector";
import { PolicyTypeSelector, type PolicyType } from "@/components/policy-type-selector";
import {
  TransactionTimeline,
  DEFAULT_TX_STEPS,
  type TimelineStep,
} from "@/components/transaction-timeline";
import { useWallet } from "@/components/wallet-provider";
import { useAutosave } from "@/hooks/use-autosave";

type CreateStep = 0 | 1 | 2 | 3;

interface PolicyDraft {
  policyType: PolicyType | null;
  coverageAmount: string;
  premium: string;
  triggerCondition: string;
  duration: string;
  oracleProvider: string;
}

interface ReceiptData {
  policyId: string;
  createdAt: string;
  policyType: string;
  coverageAmount: string;
  premium: string;
  duration: string;
  triggerCondition: string;
  oracleProvider: string;
}

const INITIAL_DRAFT: PolicyDraft = {
  policyType: null,
  coverageAmount: "",
  premium: "",
  triggerCondition: "",
  duration: "",
  oracleProvider: "",
};

const STEP_LABELS = ["Select Type", "Configure", "Review", "Submit"];

const MAX_COVERAGE_AMOUNT = 1_000_000;

const ORACLE_PROVIDER_MAP: Record<PolicyType, OracleProvider[]> = {
  weather: [
    {
      id: "weatherlink-prime",
      name: "WeatherLink Prime",
      network: "Stellar Weather Network",
      confidence: 96,
      latency: "2.3s",
      fallbackTo: "RainGauge Secure",
    },
    {
      id: "rain-gauge-secure",
      name: "RainGauge Secure",
      network: "Agriculture Feed",
      confidence: 91,
      latency: "3.1s",
      fallbackTo: "Climate Sentinel",
    },
    {
      id: "climate-sentinel",
      name: "Climate Sentinel",
      network: "Regional Backup",
      confidence: 84,
      latency: "4.5s",
    },
  ],
  flight: [
    {
      id: "orbit-flight-feed",
      name: "Orbit Flight Feed",
      network: "Aviation Oracle Mesh",
      confidence: 95,
      latency: "2.8s",
      fallbackTo: "GateTime Network",
    },
    {
      id: "gate-time-network",
      name: "GateTime Network",
      network: "Airport Telemetry",
      confidence: 89,
      latency: "3.6s",
    },
  ],
  "smart-contract": [
    {
      id: "auditwatch-mainnet",
      name: "AuditWatch Mainnet",
      network: "Security Telemetry",
      confidence: 93,
      latency: "1.9s",
      fallbackTo: "Sentinel Hash",
    },
    {
      id: "sentinel-hash",
      name: "Sentinel Hash",
      network: "Static Analyzer Stream",
      confidence: 80,
      latency: "3.9s",
    },
  ],
  asset: [
    {
      id: "marketvector-v1",
      name: "MarketVector v1",
      network: "Cross-Exchange Aggregator",
      confidence: 90,
      latency: "2.4s",
      fallbackTo: "DepthSignal",
    },
    {
      id: "depth-signal",
      name: "DepthSignal",
      network: "Orderbook Snapshot",
      confidence: 86,
      latency: "3.4s",
    },
  ],
  health: [],
};

function StepIndicator({ current }: { current: CreateStep }) {
  return (
    <nav className="stepper" aria-label="Policy creation steps">
      <ol className="stepper__list">
        {STEP_LABELS.map((label, index) => {
          const isDone = index < current;
          const isActive = index === current;
          return (
            <li
              key={label}
              className={`stepper__item ${isActive ? "stepper__item--active" : ""} ${isDone ? "stepper__item--done" : ""}`}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="stepper__marker" aria-hidden="true">
                {isDone ? (
                  <Icon name="check" size="sm" tone="contrast" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </span>
              <span className="stepper__label">{label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function makePolicyId() {
  const sequence = Math.floor(100 + Math.random() * 900);
  return `POL-${new Date().getUTCFullYear()}-${sequence}`;
}

function SuccessReceipt({
  receipt,
  onCreateAnother,
}: {
  receipt: ReceiptData;
  onCreateAnother: () => void;
}) {
  const [receiptMessage, setReceiptMessage] = useState(
    "Use share or download to keep a local handoff record.",
  );

  async function handleShare() {
    const shareUrl = `${window.location.origin}/history?policy=${encodeURIComponent(receipt.policyId)}`;
    const shareText = `Policy ${receipt.policyId} is confirmed on StellarInsure. Coverage: ${receipt.coverageAmount} XLM.`;

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: `StellarInsure Receipt ${receipt.policyId}`,
          text: shareText,
          url: shareUrl,
        });
        setReceiptMessage("Receipt shared successfully.");
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        setReceiptMessage("Share link copied to clipboard.");
        return;
      }

      setReceiptMessage("Sharing is not supported in this browser.");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setReceiptMessage("Share was canceled.");
        return;
      }

      setReceiptMessage("Unable to share receipt right now.");
    }
  }

  function handleDownload() {
    const lines = [
      "StellarInsure Policy Receipt",
      `Policy ID: ${receipt.policyId}`,
      `Created: ${new Date(receipt.createdAt).toLocaleString("en-US")}`,
      `Policy Type: ${receipt.policyType}`,
      `Coverage Amount: ${receipt.coverageAmount} XLM`,
      `Premium: ${receipt.premium} XLM`,
      `Duration: ${receipt.duration} days`,
      `Oracle Source: ${receipt.oracleProvider}`,
      `Trigger Condition: ${receipt.triggerCondition}`,
    ];

    try {
      const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${receipt.policyId.toLowerCase()}-receipt.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
      setReceiptMessage("Receipt downloaded.");
    } catch {
      setReceiptMessage("Download failed. Please try again.");
    }
  }

  return (
    <div className="create-success state-card motion-panel" role="status" aria-live="polite">
      <span className="state-icon" aria-hidden="true">
        <Icon name="check" size="lg" tone="success" />
      </span>
      <h3>Policy Created Successfully</h3>
      <p className="state-copy">
        Your policy has been confirmed on the Stellar network. Receipt ID: <strong>{receipt.policyId}</strong>
      </p>

      <dl className="definition-grid definition-grid--compact receipt-grid">
        <div>
          <dt>Policy ID</dt>
          <dd>{receipt.policyId}</dd>
        </div>
        <div>
          <dt>Oracle Source</dt>
          <dd>{receipt.oracleProvider}</dd>
        </div>
        <div>
          <dt>Coverage</dt>
          <dd>{receipt.coverageAmount} XLM</dd>
        </div>
        <div>
          <dt>Premium</dt>
          <dd>{receipt.premium} XLM</dd>
        </div>
      </dl>

      <div className="policy-copy-block">
        <h4>Next Steps</h4>
        <ul>
          <li>Track settlement and status updates from transaction history.</li>
          <li>Share this receipt with operations or compliance stakeholders.</li>
          <li>Create another policy for a separate trigger condition.</li>
        </ul>
      </div>

      <div className="inline-actions">
        <button className="cta-secondary" type="button" onClick={handleShare}>
          Share Receipt
        </button>
        <button className="cta-secondary" type="button" onClick={handleDownload}>
          Download Receipt
        </button>
        <Link className="cta-primary" href="/history">
          View Transaction History
        </Link>
        <button className="cta-secondary" type="button" onClick={onCreateAnother}>
          Create Another Policy
        </button>
      </div>

      <p className="form-status" role="status" aria-live="polite">
        {receiptMessage}
      </p>
    </div>
  );
}

export default function CreatePolicyPageClient() {
  const [draft, setDraft, clearDraft] = useAutosave<PolicyDraft>(
    "stellarinsure-policy-draft",
    INITIAL_DRAFT,
  );
  const [step, setStep] = useState<CreateStep>(() => {
    if (draft.policyType && draft.coverageAmount && draft.triggerCondition) return 2;
    if (draft.policyType) return 1;
    return 0;
  });
  const [txSteps, setTxSteps] = useState<TimelineStep[]>(DEFAULT_TX_STEPS);
  const [coverageTouched, setCoverageTouched] = useState(false);
  const [oracleState, setOracleState] = useState<OracleProviderState>("loading");
  const [oracleProviders, setOracleProviders] = useState<OracleProvider[]>([]);
  const [oracleReloadCounter, setOracleReloadCounter] = useState(0);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const { isConnected, message: walletMessage, status: walletStatus } = useWallet();

  function updateDraft<K extends keyof PolicyDraft>(field: K, value: PolicyDraft[K]) {
    setDraft({ ...draft, [field]: value });
  }

  function handleTypeSelect(type: PolicyType) {
    setDraft({ ...draft, policyType: type, oracleProvider: "" });
    setStep(1);
    setReceipt(null);
  }

  useEffect(() => {
    const selectedPolicyType = draft.policyType;

    if (!selectedPolicyType) {
      setOracleProviders([]);
      setOracleState("loading");
      return;
    }

    setOracleState("loading");

    const timer = window.setTimeout(() => {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        setOracleProviders([]);
        setOracleState("error");
        return;
      }

      const providers = ORACLE_PROVIDER_MAP[selectedPolicyType] ?? [];
      setOracleProviders(providers);
      setOracleState(providers.length > 0 ? "ready" : "empty");
    }, 650);

    return () => window.clearTimeout(timer);
  }, [draft.policyType, oracleReloadCounter]);

  useEffect(() => {
    if (oracleState !== "ready") {
      return;
    }

    if (oracleProviders.length === 0 || draft.oracleProvider) {
      return;
    }

    updateDraft("oracleProvider", oracleProviders[0].id);
  }, [draft.oracleProvider, oracleProviders, oracleState]);

  function handleConfigureNext() {
    setCoverageTouched(true);

    if (!isConfigValid) {
      return;
    }

    setStep(2);
  }

  function handleBack() {
    if (step > 0) {
      setStep((step - 1) as CreateStep);
    }
  }

  function simulateSubmit() {
    if (!isWalletReady) {
      return;
    }

    const activeOracle = oracleProviders.find((provider) => provider.id === draft.oracleProvider);
    const coverageForReceipt =
      parsedCoverageAmount !== null ? formatAssetAmount(parsedCoverageAmount) : draft.coverageAmount;
    const nextReceipt: ReceiptData = {
      policyId: makePolicyId(),
      createdAt: new Date().toISOString(),
      policyType: draft.policyType ? draft.policyType.replace("-", " ") : "Unknown",
      coverageAmount: coverageForReceipt,
      premium: draft.premium,
      duration: draft.duration,
      triggerCondition: draft.triggerCondition,
      oracleProvider: activeOracle?.name ?? draft.oracleProvider,
    };

    setStep(3);
    setReceipt(null);

    const updatedSteps = [...DEFAULT_TX_STEPS];
    updatedSteps[0] = { ...updatedSteps[0], status: "active" };
    setTxSteps(updatedSteps);

    setTimeout(() => {
      const next = [...updatedSteps];
      next[0] = { ...next[0], status: "completed" };
      next[1] = { ...next[1], status: "active" };
      setTxSteps(next);
    }, 1200);

    setTimeout(() => {
      const next = [...updatedSteps];
      next[0] = { ...next[0], status: "completed" };
      next[1] = { ...next[1], status: "completed" };
      next[2] = { ...next[2], status: "active" };
      setTxSteps(next);
    }, 2400);

    setTimeout(() => {
      const next = [...updatedSteps];
      next[0] = { ...next[0], status: "completed" };
      next[1] = { ...next[1], status: "completed" };
      next[2] = { ...next[2], status: "completed" };
      setTxSteps(next);
      setReceipt(nextReceipt);
      clearDraft();
    }, 3600);
  }

  const parsedCoverageAmount = parseAmountInput(draft.coverageAmount);
  const coverageError =
    draft.coverageAmount.trim() === ""
      ? "Enter a coverage amount to continue."
      : parsedCoverageAmount === null || parsedCoverageAmount <= 0
        ? "Enter a valid coverage amount in XLM."
        : parsedCoverageAmount > MAX_COVERAGE_AMOUNT
          ? `Coverage amount cannot exceed ${formatAssetAmount(MAX_COVERAGE_AMOUNT)} XLM.`
          : undefined;

  const selectedOracle = useMemo(
    () => oracleProviders.find((provider) => provider.id === draft.oracleProvider),
    [draft.oracleProvider, oracleProviders],
  );

  const isConfigValid =
    coverageError === undefined &&
    draft.triggerCondition.trim() !== "" &&
    draft.premium.trim() !== "" &&
    draft.duration.trim() !== "" &&
    oracleState === "ready" &&
    draft.oracleProvider.trim() !== "";

  const isWalletReady = isConnected && walletStatus !== "checking" && walletStatus !== "connecting";

  return (
    <main id="main-content" className="create-page">
      <div className="section-header">
        <span className="eyebrow">New Policy</span>
        <h1>Create a Policy</h1>
        <p>
          Configure your parametric insurance policy step by step. Your progress is saved
          automatically and will be restored if you leave and return.
        </p>
      </div>

      <StepIndicator current={step} />

      {step === 0 && (
        <section className="create-section motion-panel" aria-labelledby="step-type-title">
          <div className="section-header">
            <h2 id="step-type-title">Choose a Policy Type</h2>
            <p>Select the type of parametric coverage that fits your needs.</p>
          </div>
          <PolicyTypeSelector selected={draft.policyType} onSelect={handleTypeSelect} />
        </section>
      )}

      {step === 1 && (
        <section className="create-section motion-panel" aria-labelledby="step-config-title">
          <div className="section-header">
            <h2 id="step-config-title">Configure Your Policy</h2>
            <p>Set the coverage parameters for your {draft.policyType?.replace("-", " ")} policy.</p>
          </div>

          <div className="form-grid">
            <label className="field">
              <span className="field__label">Coverage Amount (XLM)</span>
              <AmountInput
                className="field__input"
                aria-invalid={Boolean(coverageError) && coverageTouched}
                aria-describedby={coverageError && coverageTouched ? "coverage-error" : "coverage-hint"}
                placeholder="e.g. 5,000.00"
                value={draft.coverageAmount}
                onChange={(value) => updateDraft("coverageAmount", value)}
                onBlur={() => setCoverageTouched(true)}
              />
              <span id="coverage-hint" className="field__hint">
                Maximum payout if the trigger condition is met. Limit: {formatAssetAmount(MAX_COVERAGE_AMOUNT)} XLM.
              </span>
              {coverageError && coverageTouched ? (
                <span id="coverage-error" className="field__error">
                  {coverageError}
                </span>
              ) : null}
            </label>

            <label className="field">
              <span className="field__label">Premium (XLM)</span>
              <input
                className="field__input"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="e.g. 200"
                value={draft.premium}
                onChange={(event) => updateDraft("premium", event.target.value)}
              />
              <span className="field__hint">One-time payment to activate the policy.</span>
            </label>

            <label className="field field--full">
              <span className="field__label">Trigger Condition</span>
              <textarea
                className="field__input field__input--textarea"
                rows={3}
                placeholder="Describe the condition that triggers the payout"
                value={draft.triggerCondition}
                onChange={(event) => updateDraft("triggerCondition", event.target.value)}
              />
              <span className="field__hint">
                The selected oracle provider evaluates this condition automatically.
              </span>
            </label>

            <label className="field">
              <span className="field__label">Duration (days)</span>
              <input
                className="field__input"
                type="number"
                inputMode="numeric"
                min="1"
                placeholder="e.g. 90"
                value={draft.duration}
                onChange={(event) => updateDraft("duration", event.target.value)}
              />
              <span className="field__hint">How long the policy stays active.</span>
            </label>
          </div>

          <section className="panel oracle-panel" aria-labelledby="oracle-source-title">
            <div className="section-header policy-subsection">
              <span className="eyebrow">Oracle Sources</span>
              <h3 id="oracle-source-title">Select a trigger data provider</h3>
              <p>Confidence scores are updated before submission. Fallback routing is shown per provider.</p>
            </div>

            <OracleSourceSelector
              state={oracleState}
              providers={oracleProviders}
              selectedId={draft.oracleProvider || null}
              onSelect={(providerId) => updateDraft("oracleProvider", providerId)}
              onRetry={() => setOracleReloadCounter((count) => count + 1)}
            />

            {oracleState === "empty" ? (
              <p className="form-status" role="status">
                This policy type has no oracle feeds yet. Select another policy type to continue.
              </p>
            ) : null}
          </section>

          <div className="form-actions">
            <button className="cta-secondary" type="button" onClick={handleBack}>
              Back
            </button>
            <button
              className="cta-primary"
              type="button"
              disabled={!isConfigValid}
              onClick={handleConfigureNext}
            >
              Continue to Review
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="create-section motion-panel" aria-labelledby="step-review-title">
          <div className="section-header">
            <h2 id="step-review-title">Review Your Policy</h2>
            <p>Confirm the details below before submitting to the Stellar network.</p>
          </div>

          <div className="panel">
            <dl className="definition-grid">
              <div>
                <dt>Policy Type</dt>
                <dd>{draft.policyType?.replace("-", " ")}</dd>
              </div>
              <div>
                <dt>Coverage</dt>
                <dd>
                  {parsedCoverageAmount !== null ? formatAssetAmount(parsedCoverageAmount) : draft.coverageAmount} XLM
                </dd>
              </div>
              <div>
                <dt>Premium</dt>
                <dd>{draft.premium} XLM</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{draft.duration} days</dd>
              </div>
              <div>
                <dt>Oracle Source</dt>
                <dd>{selectedOracle?.name ?? "Not selected"}</dd>
              </div>
              <div>
                <dt>Confidence</dt>
                <dd>{selectedOracle ? `${selectedOracle.confidence}%` : "-"}</dd>
              </div>
            </dl>
            <div className="policy-copy-block" style={{ marginTop: "var(--space-4)" }}>
              <h3>Trigger Condition</h3>
              <p>{draft.triggerCondition}</p>
            </div>
          </div>

          <div className="form-actions">
            <button className="cta-secondary" type="button" onClick={handleBack}>
              Back
            </button>
            <button className="cta-primary" type="button" disabled={!isWalletReady} onClick={simulateSubmit}>
              Sign and Submit
            </button>
            <button
              className="cta-secondary"
              type="button"
              onClick={() => {
                clearDraft();
                setStep(0);
              }}
            >
              Discard Draft
            </button>
          </div>

          {!isWalletReady ? (
            <p className="form-status" role="status" aria-live="polite">
              {walletStatus === "unsupported"
                ? "Wallet not supported in this browser. Install a compatible wallet extension to continue."
                : walletStatus === "checking"
                  ? "Checking wallet availability..."
                  : walletStatus === "connecting"
                    ? "Complete wallet connection to submit this policy."
                    : walletMessage}
            </p>
          ) : null}
        </section>
      )}

      {step === 3 && (
        <section className="create-section motion-panel" aria-labelledby="step-submit-title">
          <div className="section-header">
            <h2 id="step-submit-title">Submitting Your Policy</h2>
            <p>Follow the progress of your on-chain transaction below.</p>
          </div>

          <div className="panel">
            <TransactionTimeline steps={txSteps} />
          </div>

          {txSteps.every((timelineStep) => timelineStep.status === "completed") && receipt ? (
            <SuccessReceipt
              receipt={receipt}
              onCreateAnother={() => {
                setStep(0);
                setTxSteps(DEFAULT_TX_STEPS);
                setReceipt(null);
              }}
            />
          ) : null}
        </section>
      )}
    </main>
  );
}
