export type TransactionType = "premium" | "payout" | "refund";
export type TransactionStatus = "successful" | "pending" | "failed";

export interface TransactionFixture {
  id: number;
  transaction_hash: string;
  amount: number;
  transaction_type: TransactionType;
  status: TransactionStatus;
  policy_id: number | null;
  claim_id: number | null;
  created_at: string;
}

const TYPES: TransactionType[] = ["premium", "payout", "refund", "premium", "premium", "payout"];
const STATUSES: TransactionStatus[] = [
  "successful", "successful", "successful", "pending", "failed", "successful",
];
const HASHES = [
  "a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd",
  "b2c3d4e5f6789012345678901234567890123456789012345678901234abcde",
  "c3d4e5f6789012345678901234567890123456789012345678901234abcdef",
  "d4e5f6789012345678901234567890123456789012345678901234abcdef01",
  "e5f6789012345678901234567890123456789012345678901234abcdef0123",
  "f6789012345678901234567890123456789012345678901234abcdef012345",
];
const AMOUNTS = [50.25, 1000.0, 200.5, 75.0, 150.75, 500.0];

export const MOCK_TRANSACTIONS: TransactionFixture[] = Array.from({ length: 38 }, (_, i) => {
  const idx = i % 6;
  const date = new Date(2026, 2, 27 - i * 2);
  return {
    id: i + 1,
    transaction_hash: HASHES[idx].slice(0, 24) + i.toString().padStart(4, "0"),
    amount: AMOUNTS[idx],
    transaction_type: TYPES[idx],
    status: STATUSES[idx],
    policy_id: idx % 2 === 0 ? Math.floor(i / 2) + 1 : null,
    claim_id: idx === 1 ? i + 1 : null,
    created_at: date.toISOString(),
  };
});
