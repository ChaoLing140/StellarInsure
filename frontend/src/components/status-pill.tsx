"use client";

import React from "react";

export type PolicyStatus = "active" | "expired" | "claimed" | "cancelled" | "pending";

interface StatusPillProps {
  status: PolicyStatus;
}

const STATUS_CONFIG: Record<
  PolicyStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "status-pill--active",
  },
  expired: {
    label: "Expired",
    className: "status-pill--expired",
  },
  claimed: {
    label: "Claimed",
    className: "status-pill--claimed",
  },
  cancelled: {
    label: "Cancelled",
    className: "status-pill--cancelled",
  },
  pending: {
    label: "Pending",
    className: "status-pill--pending",
  },
};

export function StatusPill({ status }: StatusPillProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <span className={`status-pill ${config.className}`} role="status">
      {config.label}
    </span>
  );
}
