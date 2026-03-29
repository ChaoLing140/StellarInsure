"use client";

import React from "react";

import { Icon, type IconName } from "./icon";

export type TimelineStepStatus = "pending" | "active" | "completed" | "failed";

export interface TimelineStep {
  id: string;
  label: string;
  description: string;
  icon: IconName;
  status: TimelineStepStatus;
}

interface TransactionTimelineProps {
  steps: TimelineStep[];
}

function stepStatusClass(status: TimelineStepStatus): string {
  return `tl-step tl-step--${status}`;
}

function statusLabel(status: TimelineStepStatus): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "active":
      return "In progress";
    case "failed":
      return "Failed";
    case "pending":
      return "Waiting";
  }
}

export const DEFAULT_TX_STEPS: TimelineStep[] = [
  {
    id: "wallet-signature",
    label: "Wallet Signature",
    description: "Requesting approval from your connected Stellar wallet.",
    icon: "wallet",
    status: "pending",
  },
  {
    id: "submission",
    label: "Transaction Submission",
    description: "Broadcasting the signed transaction to the Stellar network.",
    icon: "document",
    status: "pending",
  },
  {
    id: "confirmation",
    label: "Chain Confirmation",
    description: "Waiting for the transaction to be confirmed in the next ledger close.",
    icon: "shield",
    status: "pending",
  },
];

export function TransactionTimeline({ steps }: TransactionTimelineProps) {
  return (
    <ol className="tl-timeline" aria-label="Transaction progress">
      {steps.map((step, index) => (
        <li key={step.id} className={stepStatusClass(step.status)}>
          <span className="tl-connector" aria-hidden="true">
            {index < steps.length - 1 && <span className="tl-line" />}
          </span>
          <span className="tl-icon" aria-hidden="true">
            {step.status === "completed" ? (
              <Icon name="check" size="sm" tone="success" />
            ) : (
              <Icon
                name={step.icon}
                size="sm"
                tone={step.status === "active" ? "accent" : step.status === "failed" ? "danger" : "muted"}
              />
            )}
          </span>
          <div className="tl-content">
            <div className="tl-header">
              <strong className="tl-label">{step.label}</strong>
              <span
                className={`tl-status tl-status--${step.status}`}
                aria-label={statusLabel(step.status)}
              >
                {statusLabel(step.status)}
              </span>
            </div>
            <p className="tl-description">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
