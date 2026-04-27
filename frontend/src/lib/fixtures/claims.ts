export type ClaimStatus = "Pending" | "Approved" | "Rejected";

export interface ClaimEvidenceItem {
  id: string;
  label: string;
  source: string;
  verifiedAt?: string;
}

export interface ClaimReviewEvent {
  id: string;
  actor: string;
  action: string;
  note: string;
  timestamp: string;
}

export interface ClaimLifecycleEvent {
  key: string;
  label: string;
  timestamp: string;
  status: "done" | "active" | "pending";
}

export interface ClaimFixture {
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
  evidence: ClaimEvidenceItem[];
  reviewEvents: ClaimReviewEvent[];
  lifecycleEvents: ClaimLifecycleEvent[];
}

export const MOCK_CLAIMS: ClaimFixture[] = [
  {
    id: "CLM-0091",
    policyId: "weather-alpha",
    policyTitle: "Northern Plains Weather Guard",
    policyType: "weather",
    status: "Approved",
    submittedAt: "2026-03-10T09:00:00Z",
    requestedAmount: 4500,
    payoutAmount: 4500,
    payoutTxHash: "a1b2c3d4e5f6789012345678901234567890abcd",
    triggerCondition: "Rainfall below 10mm over 30-day window",
    evidence: [
      {
        id: "ev-1",
        label: "Rainfall Station Export",
        source: "NOAA Weather API",
        verifiedAt: "2026-03-11T14:00:00Z",
      },
      {
        id: "ev-2",
        label: "Satellite Imagery Report",
        source: "NASA Earth Observation",
        verifiedAt: "2026-03-12T10:30:00Z",
      },
    ],
    reviewEvents: [
      {
        id: "rev-1",
        actor: "Oracle Node #3",
        action: "Evidence Verified",
        note: "Rainfall data confirmed below threshold.",
        timestamp: "2026-03-11T14:00:00Z",
      },
      {
        id: "rev-2",
        actor: "Smart Contract",
        action: "Claim Approved",
        note: "Payout of 4,500 XLM triggered automatically.",
        timestamp: "2026-03-12T08:00:00Z",
      },
    ],
    lifecycleEvents: [
      { key: "submitted", label: "Claim Submitted", timestamp: "2026-03-10T09:00:00Z", status: "done" },
      { key: "evidence", label: "Evidence Verified", timestamp: "2026-03-11T14:00:00Z", status: "done" },
      { key: "approved", label: "Claim Approved", timestamp: "2026-03-12T08:00:00Z", status: "done" },
      { key: "payout", label: "Payout Issued", timestamp: "2026-03-12T09:15:00Z", status: "done" },
    ],
  },
  {
    id: "CLM-0042",
    policyId: "flight-orbit",
    policyTitle: "Flight Orbit Delay Cover",
    policyType: "flight",
    status: "Pending",
    submittedAt: "2026-04-01T12:00:00Z",
    requestedAmount: 1800,
    triggerCondition: "Flight delay exceeding 3 hours",
    evidence: [
      {
        id: "ev-3",
        label: "Airline Delay Report",
        source: "Airline Delay API",
      },
    ],
    reviewEvents: [
      {
        id: "rev-3",
        actor: "Oracle Node #1",
        action: "Evidence Submitted",
        note: "Awaiting oracle confirmation.",
        timestamp: "2026-04-01T13:00:00Z",
      },
    ],
    lifecycleEvents: [
      { key: "submitted", label: "Claim Submitted", timestamp: "2026-04-01T12:00:00Z", status: "done" },
      { key: "evidence", label: "Evidence Verified", timestamp: "", status: "active" },
      { key: "approved", label: "Claim Approved", timestamp: "", status: "pending" },
      { key: "payout", label: "Payout Issued", timestamp: "", status: "pending" },
    ],
  },
  {
    id: "CLM-0017",
    policyId: "smart-contract-alpha",
    policyTitle: "Smart Contract Risk Shield",
    policyType: "smart-contract",
    status: "Rejected",
    submittedAt: "2026-02-20T08:30:00Z",
    requestedAmount: 8000,
    triggerCondition: "Smart contract exploit detected with > $50k loss",
    evidence: [
      {
        id: "ev-4",
        label: "Audit Report",
        source: "Ethereum Audit API",
        verifiedAt: "2026-02-21T11:00:00Z",
      },
    ],
    reviewEvents: [
      {
        id: "rev-4",
        actor: "Oracle Node #2",
        action: "Evidence Verified",
        note: "Loss threshold not met according to on-chain data.",
        timestamp: "2026-02-21T11:00:00Z",
      },
      {
        id: "rev-5",
        actor: "Smart Contract",
        action: "Claim Rejected",
        note: "Trigger condition not satisfied.",
        timestamp: "2026-02-22T09:00:00Z",
      },
    ],
    lifecycleEvents: [
      { key: "submitted", label: "Claim Submitted", timestamp: "2026-02-20T08:30:00Z", status: "done" },
      { key: "evidence", label: "Evidence Verified", timestamp: "2026-02-21T11:00:00Z", status: "done" },
      { key: "rejected", label: "Claim Rejected", timestamp: "2026-02-22T09:00:00Z", status: "done" },
    ],
  },
];
