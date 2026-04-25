"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { Skeleton, SkeletonText } from "@/components/skeleton";
import { StatusPill } from "@/components/status-pill";
import {
  PolicyLifecycleTimeline,
  type LifecycleEvent,
} from "@/components/policy-lifecycle-timeline";

type ClaimStatus = "Pending" | "Approved" | "Rejected";

interface EvidenceItem {
  id: string;
  label: string;
  source: string;
  verifiedAt?: string;
}

interface ReviewEvent {
  id: string;
  actor: string;
  action: string;
  note: string;
  timestamp: string;
}

interface ClaimRecord {
  id: string;
  policyId: string;
  policyTitle: string;
  policyType: string;
  status: ClaimStatus;
  submittedAt: string;
  requestedAmount: number;
  payoutAmount?: number;
  payoutTxHash?: string;
  triggerCondition: string;
  evidence: EvidenceItem[];
  reviewEvents: ReviewEvent[];
  lifecycleEvents: LifecycleEvent[];
}

const CLAIM_RECORDS: Record<string, ClaimRecord | "error"> = {
  "CLM-0091": {
    id: "CLM-0091",
    policyId: "weather-alpha",
    policyTitle: "Northern Plains Weather Guard",
    policyType: "Weather protection",
    status: "Approved",
    submittedAt: "2026-03-18T14:30:00.000Z",
    requestedAmount: 4500,
    payoutAmount: 4500,
    payoutTxHash: "a1b2c3d4e5f6789012345678901234567890abcd",
    triggerCondition: "Rainfall below 50mm during the monitored growth window.",
    evidence: [
      {
        id: "ev-1",
        label: "Rainfall Station Export",
        source: "NOAA Weather API",
        verifiedAt: "2026-03-18T15:00:00.000Z",
      },
      {
        id: "ev-2",
        label: "Oracle Verification Bundle",
        source: "WeatherLink Prime",
        verifiedAt: "2026-03-18T15:05:00.000Z",
      },
    ],
    reviewEvents: [
      {
        id: "rev-1",
        actor: "Oracle Engine",
        action: "Evidence Verified",
        note: "Rainfall data confirmed below trigger threshold of 50mm.",
        timestamp: "2026-03-18T15:05:00.000Z",
      },
      {
        id: "rev-2",
        actor: "Smart Contract",
        action: "Claim Approved",
        note: "Automatic approval triggered. Payout initiated.",
        timestamp: "2026-03-18T15:06:00.000Z",
      },
    ],
    lifecycleEvents: [
      {
        id: "lc-1",
        type: "created",
        label: "Claim Submitted",
        description: "Claim submitted with rainfall evidence bundle.",
        timestamp: "2026-03-18T14:30:00.000Z",
      },
      {
        id: "lc-2",
        type: "trigger_met",
        label: "Evidence Verified",
        description: "Oracle confirmed trigger condition was met.",
        timestamp: "2026-03-18T15:05:00.000Z",
      },
      {
        id: "lc-3",
        type: "payout",
        label: "Payout Issued",
        description: "4,500.00 XLM sent to policyholder wallet.",
        timestamp: "2026-03-18T15:06:00.000Z",
        amount: 4500,
        txHash: "a1b2c3d4e5f6789012345678901234567890abcd",
      },
    ],
  },
  "CLM-0042": {
    id: "CLM-0042",
    policyId: "flight-orbit",
    policyTitle: "Flight Orbit Delay Cover",
    policyType: "Flight delay protection",
    status: "Pending",
    submittedAt: "2026-04-02T10:00:00.000Z",
    requestedAmount: 800,
    triggerCondition: "Departure delay greater than 120 minutes.",
    evidence: [
      {
        id: "ev-3",
        label: "Flight Status Report",
        source: "Orbit Flight Feed",
      },
    ],
    reviewEvents: [
      {
        id: "rev-3",
        actor: "Oracle Engine",
        action: "Evidence Received",
        note: "Flight delay data received. Awaiting confirmation.",
        timestamp: "2026-04-02T10:05:00.000Z",
      },
    ],
    lifecycleEvents: [
      {
        id: "lc-4",
        type: "created",
        label: "Claim Submitted",
        description: "Claim submitted with flight delay report.",
        timestamp: "2026-04-02T10:00:00.000Z",
      },
      {
        id: "lc-5",
        type: "premium_paid",
        label: "Evidence Received",
        description: "Oracle received flight status data.",
        timestamp: "2026-04-02T10:05:00.000Z",
      },
    ],
  },
  "CLM-error": "error",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function claimStatusToPillStatus(status: ClaimStatus) {
  if (status === "Approved") return "claimed";
  if (status === "Rejected") return "cancelled";
  return "pending";
}

export default function ClaimDetailPageClient({
  params,
}: {
  params: { claimId: string };
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [record, setRecord] = useState<ClaimRecord | "error" | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => {
      const found = CLAIM_RECORDS[params.claimId];
      setRecord(found ?? null);
      setIsLoading(false);
    }, 240);
    return () => window.clearTimeout(timer);
  }, [params.claimId]);

  if (isLoading) {
    return (
      <main id="main-content" tabIndex={-1} className="claim-detail-page page-shell">
        <div className="section-header">
          <Skeleton style={{ height: 12, width: 80, marginBottom: "0.5rem" }} />
          <Skeleton
            style={{ height: 28, width: 260, marginBottom: "0.5rem" }}
          />
          <Skeleton style={{ height: 14, width: 180 }} />
        </div>
        <div className="panel motion-panel" aria-busy="true">
          <SkeletonText lines={4} />
        </div>
      </main>
    );
  }

  if (!record || record === "error") {
    return (
      <main id="main-content" tabIndex={-1} className="claim-detail-page page-shell">
        <div className="tx-empty" role="status">
          <span className="tx-empty-icon" aria-hidden="true">
            <Icon name="alert-circle" size="lg" tone="danger" />
          </span>
          <h1>Claim not found</h1>
          <p className="state-copy">
            We could not load claim <strong>{params.claimId}</strong>. It may
            have been removed or the ID is incorrect.
          </p>
          <Link className="cta-secondary" href="/policies">
            Back to Policies
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" tabIndex={-1} className="claim-detail-page page-shell">
      {/* Header */}
      <div className="section-header motion-panel">
        <span className="eyebrow">Claim Detail</span>
        <h1 id="claim-title">{record.id}</h1>
        <p>
          Filed against{" "}
          <Link
            href={`/policies/${record.policyId}`}
            className="tx-detail-link"
          >
            {record.policyTitle}
          </Link>
        </p>
      </div>

      {/* Summary */}
      <section
        className="panel motion-panel"
        aria-labelledby="claim-summary-title"
      >
        <div className="panel-heading">
          <Icon name="document" size="md" tone="accent" aria-hidden="true" />
          <h2 id="claim-summary-title">Claim Summary</h2>
        </div>

        <dl className="definition-grid">
          <div>
            <dt>Claim Reference</dt>
            <dd>{record.id}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <StatusPill status={claimStatusToPillStatus(record.status)} />
            </dd>
          </div>
          <div>
            <dt>Policy Type</dt>
            <dd>{record.policyType}</dd>
          </div>
          <div>
            <dt>Submitted</dt>
            <dd>
              <time dateTime={record.submittedAt}>
                {formatDate(record.submittedAt)}
              </time>
            </dd>
          </div>
          <div>
            <dt>Requested Amount</dt>
            <dd>
              {record.requestedAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}{" "}
              XLM
            </dd>
          </div>
          {record.payoutAmount !== undefined && (
            <div>
              <dt>Payout Amount</dt>
              <dd>
                {record.payoutAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}{" "}
                XLM
              </dd>
            </div>
          )}
          <div className="definition-grid__full">
            <dt>Trigger Condition</dt>
            <dd>{record.triggerCondition}</dd>
          </div>
        </dl>

        {record.payoutTxHash && (
          <div style={{ marginTop: "var(--space-3)" }}>
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${record.payoutTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tx-detail-link tx-detail-link--with-icon"
              aria-label="View payout transaction on Stellar Explorer"
            >
              <span>View payout on Stellar Expert</span>
              <Icon name="arrow-up-right" size="sm" tone="accent" />
            </a>
          </div>
        )}
      </section>

      {/* Evidence */}
      <section
        className="panel motion-panel"
        aria-labelledby="claim-evidence-title"
      >
        <div className="panel-heading">
          <Icon name="verify" size="md" tone="accent" aria-hidden="true" />
          <h2 id="claim-evidence-title">Evidence</h2>
        </div>

        {record.evidence.length === 0 ? (
          <p className="state-copy">
            No evidence items attached to this claim.
          </p>
        ) : (
          <ul className="claim-evidence-list" aria-label="Evidence items">
            {record.evidence.map((item) => (
              <li key={item.id} className="claim-evidence-item">
                <span className="claim-evidence-item__icon" aria-hidden="true">
                  <Icon name="shield" size="sm" tone="accent" />
                </span>
                <div className="claim-evidence-item__body">
                  <strong>{item.label}</strong>
                  <span className="claim-evidence-item__source">
                    Source: {item.source}
                  </span>
                  {item.verifiedAt && (
                    <span className="claim-evidence-item__verified">
                      Verified{" "}
                      <time dateTime={item.verifiedAt}>
                        {formatDate(item.verifiedAt)}
                      </time>
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Review Events */}
      <section
        className="panel motion-panel"
        aria-labelledby="claim-review-title"
      >
        <div className="panel-heading">
          <Icon name="activity" size="md" tone="accent" aria-hidden="true" />
          <h2 id="claim-review-title">Review Events</h2>
        </div>

        {record.reviewEvents.length === 0 ? (
          <p className="state-copy">No review events recorded yet.</p>
        ) : (
          <ul className="claim-review-list" aria-label="Review events">
            {record.reviewEvents.map((rev) => (
              <li key={rev.id} className="claim-review-item">
                <div className="claim-review-item__header">
                  <strong>{rev.action}</strong>
                  <span className="claim-review-item__actor">{rev.actor}</span>
                  <time
                    className="claim-review-item__time"
                    dateTime={rev.timestamp}
                  >
                    {formatDate(rev.timestamp)}
                  </time>
                </div>
                <p className="claim-review-item__note">{rev.note}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Lifecycle Timeline */}
      <section
        className="panel motion-panel"
        aria-labelledby="claim-lifecycle-title"
      >
        <div className="panel-heading">
          <Icon name="layers" size="md" tone="accent" aria-hidden="true" />
          <h2 id="claim-lifecycle-title">Claim Lifecycle</h2>
        </div>
        <PolicyLifecycleTimeline events={record.lifecycleEvents} />
      </section>

      {/* Actions */}
      <div className="form-actions">
        <Link className="cta-secondary" href={`/policies/${record.policyId}`}>
          <Icon name="chevron-up" size="sm" tone="default" aria-hidden="true" />
          Back to Policy
        </Link>
        <Link className="cta-secondary" href="/history">
          View Transaction History
        </Link>
      </div>
    </main>
  );
}
