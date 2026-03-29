"use client";

import React, { startTransition, useEffect, useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { Skeleton } from "@/components/skeleton";

type TxType = "premium" | "payout" | "refund" | "all";
type TxStatus = "successful" | "pending" | "failed" | "all";

interface Transaction {
  id: number;
  transaction_hash: string;
  amount: number;
  transaction_type: string;
  status: string;
  policy_id: number | null;
  claim_id: number | null;
  created_at: string;
}

const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 38 }, (_, i) => {
  const types = ["premium", "payout", "refund", "premium", "premium", "payout"];
  const statuses = ["successful", "successful", "successful", "pending", "failed", "successful"];
  const hashes = [
    "a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd",
    "b2c3d4e5f6789012345678901234567890123456789012345678901234abcde",
    "c3d4e5f6789012345678901234567890123456789012345678901234abcdef",
    "d4e5f6789012345678901234567890123456789012345678901234abcdef01",
    "e5f6789012345678901234567890123456789012345678901234abcdef0123",
    "f6789012345678901234567890123456789012345678901234abcdef012345",
  ];
  const amounts = [50.25, 1000.0, 200.5, 75.0, 150.75, 500.0];
  const idx = i % 6;
  const date = new Date(2026, 2, 27 - i * 2);

  return {
    id: i + 1,
    transaction_hash: hashes[idx].slice(0, 24) + i.toString().padStart(4, "0"),
    amount: amounts[idx],
    transaction_type: types[idx],
    status: statuses[idx],
    policy_id: idx % 2 === 0 ? Math.floor(i / 2) + 1 : null,
    claim_id: idx === 1 ? i + 1 : null,
    created_at: date.toISOString(),
  };
});

const STELLAR_EXPLORER_BASE = "https://stellar.expert/explorer/testnet/tx/";
const PER_PAGE = 8;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortenHash(hash: string): string {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function StatusBadge({ status }: { status: string }) {
  const classMap: Record<string, string> = {
    successful: "tx-badge tx-badge--success",
    pending: "tx-badge tx-badge--pending",
    failed: "tx-badge tx-badge--failed",
  };

  return (
    <span className={classMap[status] ?? "tx-badge"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const classMap: Record<string, string> = {
    premium: "tx-badge tx-badge--premium",
    payout: "tx-badge tx-badge--payout",
    refund: "tx-badge tx-badge--refund",
  };

  return (
    <span className={classMap[type] ?? "tx-badge"}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

export default function TransactionHistoryPage() {
  const [typeFilter, setTypeFilter] = useState<TxType>("all");
  const [statusFilter, setStatusFilter] = useState<TxStatus>("all");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const deferredTypeFilter = useDeferredValue(typeFilter);
  const deferredStatusFilter = useDeferredValue(statusFilter);
  const isFiltering =
    deferredTypeFilter !== typeFilter || deferredStatusFilter !== statusFilter;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((tx) => {
      const matchType =
        deferredTypeFilter === "all" || tx.transaction_type === deferredTypeFilter;
      const matchStatus =
        deferredStatusFilter === "all" || tx.status === deferredStatusFilter;

      return matchType && matchStatus;
    });
  }, [deferredStatusFilter, deferredTypeFilter]);

  const total = filtered.length;
  const totalPages = Math.ceil(total / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function getPolicyHref(policyId: number | null) {
    if (policyId === 1) {
      return "/policies/weather-alpha";
    }
    if (policyId === 2) {
      return "/policies/flight-orbit";
    }
    return "/policies/weather-alpha";
  }

  function handleTypeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as TxType;
    startTransition(() => {
      setTypeFilter(value);
      setPage(1);
      setExpandedId(null);
    });
  }

  function handleStatusChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as TxStatus;
    startTransition(() => {
      setStatusFilter(value);
      setPage(1);
      setExpandedId(null);
    });
  }

  return (
    <main id="main-content" className="tx-history-page">
      <div className="section-header">
        <span className="eyebrow">Transaction History</span>
        <h1 id="tx-history-title">Your On-Chain Activity</h1>
        <p>
          View all your premium payments, claim payouts, and refunds with direct
          links to Stellar Explorer.
        </p>
      </div>

      <div className="tx-filters motion-panel" role="search" aria-label="Filter transactions">
        <div className="tx-filter-group">
          <label htmlFor="type-filter" className="tx-filter-label">
            Type
          </label>
          <select
            id="type-filter"
            className="tx-select"
            value={typeFilter}
            onChange={handleTypeChange}
          >
            <option value="all">All Types</option>
            <option value="premium">Premium</option>
            <option value="payout">Payout</option>
            <option value="refund">Refund</option>
          </select>
        </div>

        <div className="tx-filter-group">
          <label htmlFor="status-filter" className="tx-filter-label">
            Status
          </label>
          <select
            id="status-filter"
            className="tx-select"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="all">All Statuses</option>
            <option value="successful">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <p className="tx-result-count" aria-live="polite">
          {total} transaction{total !== 1 ? "s" : ""} found
        </p>
        <p className="tx-filtering" aria-live="polite" role="status">
          {isFiltering ? "Updating results..." : "Filters are up to date."}
        </p>
      </div>

      {isLoading ? (
        <div
          className="tx-table-wrapper motion-panel"
          role="region"
          aria-label="Loading transactions"
          aria-busy="true"
        >
          <span className="visually-hidden">Loading transactions, please wait.</span>
          <table className="tx-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Type</th>
                <th scope="col">Amount (XLM)</th>
                <th scope="col">Status</th>
                <th scope="col">Hash</th>
                <th scope="col">Details</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={`sk-row-${i}`} className="tx-row">
                  <td><Skeleton style={{ height: "14px", width: "120px" }} /></td>
                  <td><Skeleton style={{ height: "22px", width: "64px", borderRadius: "20px" }} /></td>
                  <td><Skeleton style={{ height: "14px", width: "60px" }} /></td>
                  <td><Skeleton style={{ height: "22px", width: "80px", borderRadius: "20px" }} /></td>
                  <td><Skeleton style={{ height: "14px", width: "100px" }} /></td>
                  <td><Skeleton style={{ height: "24px", width: "28px", borderRadius: "4px" }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : paginated.length === 0 ? (
        <div className="tx-empty" role="status">
          <span className="tx-empty-icon" aria-hidden="true">
            <Icon name="document" size="lg" tone="muted" />
          </span>
          <p>No transactions match your filters.</p>
        </div>
      ) : (
        <div
          className={`tx-table-wrapper motion-panel ${isFiltering ? "tx-table-wrapper--loading" : ""}`}
          role="region"
          aria-label="Transaction list"
          aria-busy={isFiltering}
        >
          {isFiltering ? (
            <table className="tx-table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Type</th>
                  <th scope="col">Amount (XLM)</th>
                  <th scope="col">Status</th>
                  <th scope="col">Hash</th>
                  <th scope="col">Details</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`filter-sk-${i}`} className="tx-row">
                    <td><Skeleton style={{ height: "14px", width: "120px" }} /></td>
                    <td><Skeleton style={{ height: "22px", width: "64px", borderRadius: "20px" }} /></td>
                    <td><Skeleton style={{ height: "14px", width: "60px" }} /></td>
                    <td><Skeleton style={{ height: "22px", width: "80px", borderRadius: "20px" }} /></td>
                    <td><Skeleton style={{ height: "14px", width: "100px" }} /></td>
                    <td><Skeleton style={{ height: "24px", width: "28px", borderRadius: "4px" }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
          <table className="tx-table" aria-labelledby="tx-history-title">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Type</th>
                <th scope="col">Amount (XLM)</th>
                <th scope="col">Status</th>
                <th scope="col">Hash</th>
                <th scope="col">Details</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((tx) => (
                <React.Fragment key={tx.id}>
                  <tr
                    className={`tx-row ${expandedId === tx.id ? "tx-row--expanded" : ""}`}
                    onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
                    style={{ cursor: "pointer" }}
                    aria-expanded={expandedId === tx.id}
                  >
                    <td data-label="Date">{formatDate(tx.created_at)}</td>
                    <td data-label="Type">
                      <TypeBadge type={tx.transaction_type} />
                    </td>
                    <td data-label="Amount" className="tx-amount">
                      {tx.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 7,
                      })}
                    </td>
                    <td data-label="Status">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td data-label="Hash">
                      <a
                        href={`${STELLAR_EXPLORER_BASE}${tx.transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tx-hash-link"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`View transaction ${shortenHash(tx.transaction_hash)} on Stellar Explorer`}
                      >
                        <span>{shortenHash(tx.transaction_hash)}</span>
                        <span className="tx-external-icon" aria-hidden="true">
                          <Icon name="arrow-up-right" size="sm" tone="accent" />
                        </span>
                      </a>
                    </td>
                    <td data-label="Details">
                      <button
                        className="tx-expand-btn"
                        aria-label={`${expandedId === tx.id ? "Collapse" : "Expand"} transaction ${tx.id} details`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(expandedId === tx.id ? null : tx.id);
                        }}
                      >
                        <Icon
                          name={expandedId === tx.id ? "chevron-up" : "chevron-down"}
                          size="sm"
                          tone="muted"
                        />
                      </button>
                    </td>
                  </tr>
                  {expandedId === tx.id && (
                    <tr className="tx-detail-row" aria-label="Transaction detail">
                      <td colSpan={6}>
                        <div className="tx-detail-panel">
                          <div className="tx-detail-grid">
                            <div>
                              <span className="tx-detail-label">Transaction ID</span>
                              <span className="tx-detail-value">#{tx.id}</span>
                            </div>
                            <div>
                              <span className="tx-detail-label">Full Hash</span>
                              <span className="tx-detail-value tx-detail-hash">{tx.transaction_hash}</span>
                            </div>
                            {tx.policy_id && (
                              <div>
                                <span className="tx-detail-label">Policy ID</span>
                                <Link
                                  className="tx-detail-link"
                                  href={getPolicyHref(tx.policy_id)}
                                  onClick={(event: React.MouseEvent<HTMLAnchorElement>) =>
                                    event.stopPropagation()
                                  }
                                >
                                  #{tx.policy_id} policy snapshot
                                </Link>
                              </div>
                            )}
                            {tx.claim_id && (
                              <div>
                                <span className="tx-detail-label">Claim ID</span>
                                <span className="tx-detail-value">#{tx.claim_id}</span>
                              </div>
                            )}
                            <div>
                              <span className="tx-detail-label">Explorer</span>
                              <a
                                href={`${STELLAR_EXPLORER_BASE}${tx.transaction_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tx-detail-link tx-detail-link--with-icon"
                              >
                                <span>View on Stellar Expert</span>
                                <Icon name="arrow-up-right" size="sm" tone="accent" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="tx-pagination" aria-label="Transaction history pagination">
          <button
            className="tx-page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            Prev
          </button>

          <div className="tx-page-numbers" role="list">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="tx-page-ellipsis" aria-hidden="true">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    role="listitem"
                    className={`tx-page-btn ${p === page ? "tx-page-btn--active" : ""}`}
                    onClick={() => setPage(p)}
                    aria-label={`Page ${p}`}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </button>
                ),
              )}
          </div>

          <button
            className="tx-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      )}

      <p className="tx-pagination-info" aria-live="polite">
        Showing {Math.min((page - 1) * PER_PAGE + 1, total)}-
        {Math.min(page * PER_PAGE, total)} of {total}
      </p>
    </main>
  );
}
