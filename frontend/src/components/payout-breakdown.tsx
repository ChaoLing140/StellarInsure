"use client";

import React, { useMemo } from "react";
import { Icon } from "@/components/icon";

export interface PayoutLineItem {
  label: string;
  amount: number;
  type: "base" | "deduction" | "bonus" | "fee" | "total";
}

export interface PayoutBreakdownProps {
  claimId?: string;
  policyType?: string;
  lineItems: PayoutLineItem[];
  currency?: string;
  isLoading?: boolean;
  status?: "pending" | "approved" | "paid" | "rejected";
}

const STATUS_CONFIG: Record<
  NonNullable<PayoutBreakdownProps["status"]>,
  { label: string; tone: "default" | "success" | "warning" | "danger" }
> = {
  pending: { label: "Pending Review", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  paid: { label: "Paid", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
};

const TYPE_COLORS: Record<PayoutLineItem["type"], string> = {
  base: "payout-row--base",
  bonus: "payout-row--bonus",
  deduction: "payout-row--deduction",
  fee: "payout-row--fee",
  total: "payout-row--total",
};

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
}

function SkeletonRow() {
  return (
    <div className="payout-row payout-row--skeleton" aria-hidden="true">
      <div className="payout-skeleton payout-skeleton--label" />
      <div className="payout-skeleton payout-skeleton--amount" />
    </div>
  );
}

export function PayoutBreakdown({
  claimId,
  policyType,
  lineItems,
  currency = "USD",
  isLoading = false,
  status = "pending",
}: PayoutBreakdownProps) {
  const totalRow = useMemo(
    () => lineItems.find((item) => item.type === "total"),
    [lineItems]
  );

  const bodyRows = useMemo(
    () => lineItems.filter((item) => item.type !== "total"),
    [lineItems]
  );

  const { label: statusLabel, tone } = STATUS_CONFIG[status];

  const netTotal = totalRow?.amount ?? bodyRows.reduce((sum, item) => {
    return item.type === "deduction" || item.type === "fee"
      ? sum - Math.abs(item.amount)
      : sum + item.amount;
  }, 0);

  return (
    <div className="payout-breakdown" role="region" aria-label="Payout breakdown">
      <div className="payout-header">
        <div className="payout-header-left">
          <Icon name="wallet" size="md" tone="accent" />
          <div>
            <h3 className="payout-title">Payout Breakdown</h3>
            {claimId && (
              <p className="payout-subtitle">
                Claim <span className="payout-mono">{claimId}</span>
                {policyType && (
                  <span className="payout-policy-type"> · {policyType}</span>
                )}
              </p>
            )}
          </div>
        </div>
        <span
          className={`payout-status-badge payout-status-badge--${tone}`}
          aria-label={`Status: ${statusLabel}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="payout-body">
        {isLoading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : bodyRows.length === 0 ? (
          <p className="payout-empty">No line items available.</p>
        ) : (
          bodyRows.map((item, index) => (
            <div
              key={index}
              className={`payout-row ${TYPE_COLORS[item.type]}`}
            >
              <span className="payout-row-label">{item.label}</span>
              <span
                className={`payout-row-amount ${
                  item.type === "deduction" || item.type === "fee"
                    ? "payout-row-amount--negative"
                    : ""
                }`}
              >
                {item.type === "deduction" || item.type === "fee" ? "−" : ""}
                {formatAmount(item.amount, currency)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="payout-divider" aria-hidden="true" />

      <div className="payout-total-row">
        <span className="payout-total-label">
          {totalRow?.label ?? "Net Payout"}
        </span>
        <span
          className={`payout-total-amount ${
            netTotal < 0 ? "payout-total-amount--negative" : ""
          }`}
        >
          {isLoading ? (
            <span className="payout-skeleton payout-skeleton--total" aria-hidden="true" />
          ) : (
            formatAmount(netTotal, currency)
          )}
        </span>
      </div>

      {status === "paid" && !isLoading && (
        <div className="payout-paid-notice">
          <Icon name="check" size="sm" tone="success" />
          <span>Funds have been disbursed to your wallet.</span>
        </div>
      )}
    </div>
  );
}
