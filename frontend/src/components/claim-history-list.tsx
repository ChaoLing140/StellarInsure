"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/icon";
import { Skeleton } from "@/components/skeleton";

export type ClaimStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "paid"
  | "processing";

export interface ClaimHistoryItem {
  id: string;
  policyId: string;
  policyTitle: string;
  amount: number;
  status: ClaimStatus;
  submittedAt: string;
  updatedAt?: string;
  evidence?: string;
}

interface ClaimHistoryListProps {
  claims: ClaimHistoryItem[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const STATUS_CONFIG: Record<ClaimStatus, { label: string; className: string }> =
  {
    pending: { label: "Pending", className: "status-pill--pending" },
    approved: { label: "Approved", className: "status-pill--approved" },
    rejected: { label: "Rejected", className: "status-pill--cancelled" },
    paid: { label: "Paid", className: "status-pill--claimed" },
    processing: {
      label: "Processing",
      className: "status-pill--claim-pending",
    },
  };

const FILTERABLE_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "paid",
] as const;

type ClaimStatusFilter = (typeof FILTERABLE_STATUSES)[number];
const CLAIM_STATUS_QUERY_PARAM = "claimStatus";

function parseStatusFilters(
  searchParams: Pick<URLSearchParams, "get">,
): ClaimStatusFilter[] {
  const rawValue = searchParams.get(CLAIM_STATUS_QUERY_PARAM);
  if (!rawValue) {
    return [];
  }

  const validStatuses = new Set<string>(FILTERABLE_STATUSES);
  return rawValue
    .split(",")
    .filter((status): status is ClaimStatusFilter =>
      validStatuses.has(status),
    );
}

function formatActiveFilters(filters: ClaimStatusFilter[]): string {
  return filters
    .map((status) => STATUS_CONFIG[status].label)
    .join(", ");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

export function ClaimHistoryList({
  claims,
  isLoading = false,
  emptyMessage = "No claims submitted yet",
}: ClaimHistoryListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<"date" | "amount" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeFilters, setActiveFilters] = useState<ClaimStatusFilter[]>(() =>
    parseStatusFilters(searchParams),
  );

  const filteredClaims = useMemo(() => {
    if (activeFilters.length === 0) {
      return claims;
    }

    return claims.filter((claim) =>
      activeFilters.includes(claim.status as ClaimStatusFilter),
    );
  }, [activeFilters, claims]);

  const sortedClaims = useMemo(() => {
    const sorted = [...filteredClaims];
    sorted.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "date") {
        comparison =
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      } else if (sortBy === "amount") {
        comparison = a.amount - b.amount;
      } else if (sortBy === "status") {
        comparison = a.status.localeCompare(b.status);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [filteredClaims, sortBy, sortOrder]);

  const updateFilters = (nextFilters: ClaimStatusFilter[]) => {
    setActiveFilters(nextFilters);

    const params = new URLSearchParams(searchParams.toString());
    if (nextFilters.length > 0) {
      params.set(CLAIM_STATUS_QUERY_PARAM, nextFilters.join(","));
    } else {
      params.delete(CLAIM_STATUS_QUERY_PARAM);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const toggleFilter = (status: ClaimStatusFilter) => {
    const nextFilters = activeFilters.includes(status)
      ? activeFilters.filter((filter) => filter !== status)
      : [...activeFilters, status];
    updateFilters(nextFilters);
  };

  const clearFilters = () => updateFilters([]);

  const toggleSort = (field: "date" | "amount" | "status") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  if (isLoading) {
    return (
      <div className="claim-history-list" aria-busy="true">
        <div className="claim-history-list__header">
          <h3>Claim History</h3>
        </div>
        <div className="claim-list" role="list" aria-label="Loading claims">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="claim-card">
              <div className="claim-card__header">
                <div>
                  <Skeleton
                    style={{
                      width: "80px",
                      height: "12px",
                      marginBottom: "0.5rem",
                    }}
                  />
                  <Skeleton style={{ width: "120px", height: "16px" }} />
                </div>
                <Skeleton
                  style={{
                    width: "70px",
                    height: "24px",
                    borderRadius: "20px",
                  }}
                />
              </div>
              <div className="definition-grid definition-grid--compact">
                <div>
                  <Skeleton
                    style={{
                      width: "60px",
                      height: "10px",
                      marginBottom: "0.3rem",
                    }}
                  />
                  <Skeleton style={{ width: "100px", height: "14px" }} />
                </div>
                <div>
                  <Skeleton
                    style={{
                      width: "50px",
                      height: "10px",
                      marginBottom: "0.3rem",
                    }}
                  />
                  <Skeleton style={{ width: "80px", height: "14px" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const controls = (
    <div className="claim-history-list__controls">
      <div
        className="claim-history-list__filters"
        role="group"
        aria-label="Filter claims by status"
      >
        {FILTERABLE_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            className="claim-filter-button"
            aria-pressed={activeFilters.includes(status)}
            onClick={() => toggleFilter(status)}
          >
            {STATUS_CONFIG[status].label}
          </button>
        ))}
      </div>
      <div className="claim-history-list__sorts" aria-label="Sort claims">
        <button
          className="sort-button"
          onClick={() => toggleSort("date")}
          aria-label={`Sort by date ${sortBy === "date" ? (sortOrder === "asc" ? "ascending" : "descending") : ""}`}
        >
          Date
          {sortBy === "date" && (
            <Icon
              name={sortOrder === "asc" ? "chevron-up" : "chevron-down"}
              size="sm"
              tone="muted"
            />
          )}
        </button>
        <button
          className="sort-button"
          onClick={() => toggleSort("amount")}
          aria-label={`Sort by amount ${sortBy === "amount" ? (sortOrder === "asc" ? "ascending" : "descending") : ""}`}
        >
          Amount
          {sortBy === "amount" && (
            <Icon
              name={sortOrder === "asc" ? "chevron-up" : "chevron-down"}
              size="sm"
              tone="muted"
            />
          )}
        </button>
        <button
          className="sort-button"
          onClick={() => toggleSort("status")}
          aria-label={`Sort by status ${sortBy === "status" ? (sortOrder === "asc" ? "ascending" : "descending") : ""}`}
        >
          Status
          {sortBy === "status" && (
            <Icon
              name={sortOrder === "asc" ? "chevron-up" : "chevron-down"}
              size="sm"
              tone="muted"
            />
          )}
        </button>
      </div>
    </div>
  );

  if (claims.length === 0 || sortedClaims.length === 0) {
    const message =
      activeFilters.length > 0
        ? `No claims match the active filters: ${formatActiveFilters(activeFilters)}.`
        : emptyMessage;

    return (
      <div className="claim-history-list">
        <div className="claim-history-list__header">
          <h3>Claim History</h3>
          {controls}
        </div>
        <div className="state-card state-card--soft" role="status">
          <span className="state-icon" aria-hidden="true">
            <Icon name="clock" size="lg" tone="muted" />
          </span>
          <p className="state-copy">{message}</p>
          {activeFilters.length > 0 && (
            <button
              type="button"
              className="tx-clear-filters-btn"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="claim-history-list">
      <div className="claim-history-list__header">
        <h3>Claim History</h3>
        {controls}
      </div>

      <div className="claim-list" role="list" aria-label="Claim history">
        {sortedClaims.map((claim) => {
          const statusConfig = STATUS_CONFIG[claim.status];

          return (
            <article key={claim.id} className="claim-card" role="listitem">
              <div className="claim-card__header">
                <div>
                  <p className="metadata-label">Claim ID</p>
                  <h4>{claim.id}</h4>
                </div>
                <span className={`status-pill ${statusConfig.className}`}>
                  {statusConfig.label}
                </span>
              </div>

              <dl className="definition-grid definition-grid--compact">
                <div>
                  <dt>Policy</dt>
                  <dd>
                    <Link
                      href={`/policies/${claim.policyId}`}
                      className="tx-detail-link"
                    >
                      {claim.policyTitle}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt>Amount</dt>
                  <dd>{formatAmount(claim.amount)} XLM</dd>
                </div>
                <div>
                  <dt>Submitted</dt>
                  <dd>{formatDate(claim.submittedAt)}</dd>
                </div>
                {claim.updatedAt && (
                  <div>
                    <dt>Updated</dt>
                    <dd>{formatDate(claim.updatedAt)}</dd>
                  </div>
                )}
                {claim.evidence && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <dt>Evidence</dt>
                    <dd>{claim.evidence}</dd>
                  </div>
                )}
              </dl>
            </article>
          );
        })}
      </div>
    </div>
  );
}
