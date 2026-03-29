"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "./icon";

export type TransactionType = "premium" | "creation";

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: TransactionType;
  amount?: number;
  policyType?: string;
  destination?: string;
  onConfirm: () => Promise<void>;
}

export function TransactionModal({
  isOpen,
  onClose,
  type,
  amount,
  policyType,
  destination,
  onConfirm,
}: TransactionModalProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset status when modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus("idle");
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleConfirm() {
    setStatus("loading");
    setErrorMessage(null);
    try {
      await onConfirm();
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.message || "Transaction failed to sign and submit.");
    }
  }

  function handleClose() {
    if (status === "loading") return; // Prevent closing while processing
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape" && status !== "loading") handleClose();
  }

  function renderContent() {
    switch (status) {
      case "loading":
        return (
          <div className="tx-empty">
            <span className="tx-empty-icon" aria-hidden="true">
              <Icon name="clock" size="lg" tone="accent" />
            </span>
            <h3>Waiting for Signature</h3>
            <p className="state-copy">Please confirm the transaction in your connected Stellar wallet.</p>
          </div>
        );
      case "error":
        return (
          <div className="tx-empty">
            <span className="tx-empty-icon" aria-hidden="true">
              <Icon name="alert" size="lg" tone="warning" />
            </span>
            <h3>Transaction Failed</h3>
            <p className="state-copy">{errorMessage}</p>
          </div>
        );
      case "success":
        return (
          <div className="tx-empty">
            <span className="tx-empty-icon" aria-hidden="true">
              <Icon name="spark" size="lg" tone="accent" />
            </span>
            <h3>Transaction Complete</h3>
            <p className="state-copy">Your transaction has been successfully recorded on the Stellar network.</p>
          </div>
        );
      case "idle":
      default:
        return (
          <>
            <div className="ob-icon" aria-hidden="true">
              <Icon name="shield" size="lg" tone="accent" />
            </div>
            <h2 id="tx-title" className="ob-title">
              {type === "premium" ? "Pay Policy Premium" : "Create New Policy"}
            </h2>
            <p id="tx-desc" className="ob-desc" style={{ marginBottom: "2rem" }}>
              {type === "premium"
                ? "Review the premium amount and sign the transaction to deposit funds into the policy vault."
                : "Review the policy details and sign the transaction to deploy your coverage on-chain."}
            </p>

            <dl className="definition-grid definition-grid--compact" style={{ marginBottom: "2rem", padding: "1.5rem", background: "rgba(0,0,0,0.03)", borderRadius: "1rem" }}>
              {type === "premium" && amount !== undefined && (
                <div>
                  <dt>Premium Amount</dt>
                  <dd>{amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} XLM</dd>
                </div>
              )}
              {type === "creation" && policyType && (
                <div>
                  <dt>Policy Type</dt>
                  <dd>{policyType}</dd>
                </div>
              )}
              {type === "creation" && amount !== undefined && (
                <div>
                  <dt>Coverage Amount</dt>
                  <dd>{amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} XLM</dd>
                </div>
              )}
              {destination && (
                <div>
                  <dt>Vault Destination</dt>
                  <dd className="tx-detail-hash">{destination}</dd>
                </div>
              )}
              <div>
                <dt>Network Fee</dt>
                <dd>0.00001 XLM</dd>
              </div>
            </dl>
          </>
        );
    }
  }

  return (
    <div
      className="ob-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-title"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="ob-modal">
        {status !== "loading" && (
          <button
            className="ob-skip"
            onClick={handleClose}
            aria-label="Close modal"
          >
            Close
          </button>
        )}

        <div className="ob-content" aria-live="polite">
          {renderContent()}
        </div>

        <div className="ob-nav">
          {status === "error" && (
            <button className="ob-btn ob-btn--ghost" onClick={() => setStatus("idle")}>
              Try Again
            </button>
          )}
          {status === "success" && (
            <button className="ob-btn ob-btn--primary" style={{ marginLeft: "auto" }} onClick={handleClose}>
              Done
            </button>
          )}
          {status === "idle" && (
            <>
              <button className="ob-btn ob-btn--ghost" onClick={handleClose}>
                Cancel
              </button>
              <button className="ob-btn ob-btn--primary" onClick={handleConfirm}>
                Confirm & Sign
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
