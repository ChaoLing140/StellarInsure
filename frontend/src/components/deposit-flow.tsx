"use client";

import React, { useState, useCallback } from "react";
import { Icon } from "@/components/icon";

export interface RiskPool {
  id: string;
  name: string;
  apy: number;
  tvl: number;
  utilizationRate: number;
  minDeposit: number;
  currency: string;
}

export interface DepositFlowProps {
  pools: RiskPool[];
  onDeposit: (poolId: string, amount: number) => Promise<void>;
  onCancel?: () => void;
  walletBalance?: number;
  currency?: string;
}

type Step = "select" | "amount" | "confirm" | "success";

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function UtilizationBar({ rate }: { rate: number }) {
  const pct = Math.min(100, Math.max(0, rate * 100));
  const color =
    pct >= 80 ? "deposit-util--high" : pct >= 50 ? "deposit-util--mid" : "deposit-util--low";
  return (
    <div className="deposit-util-track" aria-label={`Utilization ${Math.round(pct)}%`}>
      <div className={`deposit-util-bar ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function PoolCard({
  pool,
  selected,
  onSelect,
}: {
  pool: RiskPool;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`deposit-pool-card ${selected ? "deposit-pool-card--selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Select ${pool.name}`}
    >
      <div className="deposit-pool-header">
        <span className="deposit-pool-name">{pool.name}</span>
        <span className="deposit-pool-apy">{pool.apy.toFixed(1)}% APY</span>
      </div>
      <div className="deposit-pool-meta">
        <span className="deposit-pool-tvl">TVL: {formatUsd(pool.tvl)}</span>
        <span className="deposit-pool-min">Min: {formatUsd(pool.minDeposit)}</span>
      </div>
      <UtilizationBar rate={pool.utilizationRate} />
      <p className="deposit-pool-util-label">
        {Math.round(pool.utilizationRate * 100)}% utilized
      </p>
    </button>
  );
}

export function DepositFlow({
  pools,
  onDeposit,
  onCancel,
  walletBalance = 0,
  currency = "USD",
}: DepositFlowProps) {
  const [step, setStep] = useState<Step>("select");
  const [selectedPool, setSelectedPool] = useState<RiskPool | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const parsedAmount = parseFloat(amountInput);
  const amountIsValid =
    !isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    selectedPool !== null &&
    parsedAmount >= selectedPool.minDeposit &&
    parsedAmount <= walletBalance;

  const handleSelectPool = useCallback((pool: RiskPool) => {
    setSelectedPool(pool);
  }, []);

  function handleNextFromSelect() {
    if (!selectedPool) return;
    setStep("amount");
  }

  function handleNextFromAmount() {
    if (!amountIsValid) return;
    setStep("confirm");
  }

  function handleBack() {
    setErrorMessage(null);
    setStep((prev) => {
      if (prev === "amount") return "select";
      if (prev === "confirm") return "amount";
      return prev;
    });
  }

  async function handleConfirmDeposit() {
    if (!selectedPool || !amountIsValid) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onDeposit(selectedPool.id, parsedAmount);
      setStep("success");
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Deposit failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setStep("select");
    setSelectedPool(null);
    setAmountInput("");
    setErrorMessage(null);
  }

  const steps: Step[] = ["select", "amount", "confirm"];
  const currentStepIndex = steps.indexOf(step);

  if (step === "success") {
    return (
      <div className="deposit-success">
        <Icon name="check" size="lg" tone="success" />
        <h3 className="deposit-success-title">Deposit Confirmed</h3>
        <p className="deposit-success-body">
          {formatUsd(parsedAmount)} has been deposited into{" "}
          <strong>{selectedPool?.name}</strong>.
        </p>
        <button type="button" className="deposit-btn deposit-btn--primary" onClick={handleReset}>
          Make Another Deposit
        </button>
      </div>
    );
  }

  return (
    <div className="deposit-flow">
      {/* Step indicator */}
      <div className="deposit-steps" role="list" aria-label="Deposit steps">
        {["Select Pool", "Enter Amount", "Confirm"].map((label, i) => (
          <div
            key={label}
            role="listitem"
            className={`deposit-step ${
              i < currentStepIndex
                ? "deposit-step--done"
                : i === currentStepIndex
                ? "deposit-step--active"
                : "deposit-step--pending"
            }`}
          >
            <span className="deposit-step-dot">
              {i < currentStepIndex ? <Icon name="check" size="sm" tone="success" /> : i + 1}
            </span>
            <span className="deposit-step-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="deposit-body">
        {/* Step 1: Select pool */}
        {step === "select" && (
          <>
            <h3 className="deposit-section-title">Choose a Risk Pool</h3>
            {pools.length === 0 ? (
              <p className="deposit-empty">No pools available at this time.</p>
            ) : (
              <div className="deposit-pool-grid">
                {pools.map((pool) => (
                  <PoolCard
                    key={pool.id}
                    pool={pool}
                    selected={selectedPool?.id === pool.id}
                    onSelect={() => handleSelectPool(pool)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 2: Enter amount */}
        {step === "amount" && selectedPool && (
          <>
            <h3 className="deposit-section-title">Enter Deposit Amount</h3>
            <p className="deposit-pool-selected">
              Pool: <strong>{selectedPool.name}</strong> · {selectedPool.apy.toFixed(1)}% APY
            </p>
            <div className="deposit-amount-field">
              <label className="deposit-label" htmlFor="deposit-amount">
                Amount ({currency})
              </label>
              <div className="deposit-amount-wrapper">
                <span className="deposit-currency-prefix">$</span>
                <input
                  id="deposit-amount"
                  className="deposit-input deposit-input--amount"
                  type="number"
                  min={selectedPool.minDeposit}
                  max={walletBalance}
                  step="0.01"
                  placeholder={`Min ${formatUsd(selectedPool.minDeposit)}`}
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="deposit-amount-hints">
                <span className="deposit-hint">
                  Balance: {formatUsd(walletBalance)}
                </span>
                <button
                  type="button"
                  className="deposit-btn-link"
                  onClick={() => setAmountInput(String(walletBalance))}
                >
                  Max
                </button>
              </div>
              {amountInput && !amountIsValid && (
                <p className="deposit-field-error" role="alert">
                  {parsedAmount < selectedPool.minDeposit
                    ? `Minimum deposit is ${formatUsd(selectedPool.minDeposit)}`
                    : parsedAmount > walletBalance
                    ? "Amount exceeds wallet balance"
                    : "Enter a valid amount"}
                </p>
              )}
            </div>
          </>
        )}

        {/* Step 3: Confirm */}
        {step === "confirm" && selectedPool && (
          <>
            <h3 className="deposit-section-title">Confirm Deposit</h3>
            <dl className="deposit-confirm-grid">
              <dt>Pool</dt>
              <dd>{selectedPool.name}</dd>
              <dt>Amount</dt>
              <dd>{formatUsd(parsedAmount)}</dd>
              <dt>Expected APY</dt>
              <dd>{selectedPool.apy.toFixed(1)}%</dd>
              <dt>Current Utilization</dt>
              <dd>{Math.round(selectedPool.utilizationRate * 100)}%</dd>
            </dl>
            <p className="deposit-confirm-notice">
              <Icon name="alert" size="sm" tone="warning" />
              Deposits are subject to a 7-day lock-up period before withdrawal.
            </p>
          </>
        )}
      </div>

      {errorMessage && (
        <p className="deposit-error" role="alert">
          <Icon name="alert" size="sm" tone="danger" />
          {errorMessage}
        </p>
      )}

      <div className="deposit-actions">
        {step !== "select" && (
          <button
            type="button"
            className="deposit-btn deposit-btn--ghost"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            Back
          </button>
        )}
        {onCancel && step === "select" && (
          <button
            type="button"
            className="deposit-btn deposit-btn--ghost"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        {step === "select" && (
          <button
            type="button"
            className="deposit-btn deposit-btn--primary"
            onClick={handleNextFromSelect}
            disabled={!selectedPool}
          >
            Continue
          </button>
        )}
        {step === "amount" && (
          <button
            type="button"
            className="deposit-btn deposit-btn--primary"
            onClick={handleNextFromAmount}
            disabled={!amountIsValid}
          >
            Review
          </button>
        )}
        {step === "confirm" && (
          <button
            type="button"
            className="deposit-btn deposit-btn--primary"
            onClick={handleConfirmDeposit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Depositing…" : "Confirm Deposit"}
          </button>
        )}
      </div>
    </div>
  );
}
