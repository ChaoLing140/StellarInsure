"use client";

import React, { useState } from "react";
import { Icon } from "./icon";

export interface RiskPool {
    id: string;
    name: string;
    balance: number;
    cooldownDays: number;
    currency: string;
}

type Step = "amount" | "review" | "processing" | "success";

export function WithdrawalFlow({
    pool,
    onWithdraw,
    onCancel,
}: {
    pool: RiskPool;
    onWithdraw: (amount: number) => Promise<void>;
    onCancel: () => void;
}) {
    const [step, setStep] = useState<Step>("amount");
    const [amountInput, setAmountInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const parsedAmount = parseFloat(amountInput);
    const isValid = !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= pool.balance;

    const handleNext = () => {
        if (step === "amount" && isValid) {
            setStep("review");
        }
    };

    const handleConfirm = async () => {
        setStep("processing");
        setIsSubmitting(true);
        setError(null);
        try {
            await onWithdraw(parsedAmount);
            setStep("success");
        } catch (e: any) {
            setError(e.message || "Withdrawal failed");
            setStep("review");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: pool.currency,
        }).format(val);
    };

    if (step === "success") {
        return (
            <div className="withdrawal-flow success-state glass-panel">
                <div className="status-icon success">
                    <Icon name="check" size="lg" tone="success" />
                </div>
                <h3>Withdrawal Requested</h3>
                <p>
                    Your request for {formatCurrency(parsedAmount)} has been submitted.
                    The cooldown period of {pool.cooldownDays} days has started.
                </p>
                <button className="cta-primary full-width" onClick={onCancel}>
                    Finish
                </button>
            </div>
        );
    }

    return (
        <div className="withdrawal-flow glass-panel">
            <div className="flow-header">
                <h3>Withdraw from {pool.name}</h3>
                <button className="close-btn" onClick={onCancel}>
                    <Icon name="close" size="sm" />
                </button>
            </div>

            <div className="flow-steps">
                <div className={`step-indicator ${step === "amount" ? "active" : "complete"}`}>1</div>
                <div className="step-line" />
                <div className={`step-indicator ${step === "review" ? "active" : step === "processing" ? "active" : ""}`}>2</div>
            </div>

            <div className="flow-content">
                {step === "amount" && (
                    <div className="step-amount">
                        <label htmlFor="withdraw-amount">Amount to withdraw</label>
                        <div className="input-group">
                            <span className="currency-prefix">$</span>
                            <input
                                id="withdraw-amount"
                                type="number"
                                value={amountInput}
                                onChange={(e) => setAmountInput(e.target.value)}
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>
                        <div className="balance-info">
                            <span>Available: {formatCurrency(pool.balance)}</span>
                            <button
                                className="max-btn"
                                onClick={() => setAmountInput(pool.balance.toString())}
                            >
                                Max
                            </button>
                        </div>
                        {!isValid && amountInput && (
                            <p className="error-text">Please enter a valid amount within your balance.</p>
                        )}
                    </div>
                )}

                {(step === "review" || step === "processing") && (
                    <div className="step-review">
                        <div className="review-item">
                            <span>Amount</span>
                            <strong>{formatCurrency(parsedAmount)}</strong>
                        </div>
                        <div className="review-item">
                            <span>Cooldown Period</span>
                            <div className="cooldown-badge">
                                <Icon name="clock" size="sm" />
                                <span>{pool.cooldownDays} Days</span>
                            </div>
                        </div>

                        <div className="warning-box">
                            <Icon name="alert" size="sm" tone="warning" />
                            <p>
                                Funds will be locked for {pool.cooldownDays} days before they can be claimed.
                                This prevents bank runs during active claim events.
                            </p>
                        </div>

                        {error && <p className="error-text">{error}</p>}
                    </div>
                )}
            </div>

            <div className="flow-actions">
                {step === "amount" ? (
                    <button
                        className="cta-primary full-width"
                        disabled={!isValid}
                        onClick={handleNext}
                    >
                        Review Withdrawal
                    </button>
                ) : (
                    <div className="button-row">
                        <button
                            className="cta-secondary"
                            onClick={() => setStep("amount")}
                            disabled={isSubmitting}
                        >
                            Back
                        </button>
                        <button
                            className="cta-primary"
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Processing..." : "Confirm & Start Cooldown"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
