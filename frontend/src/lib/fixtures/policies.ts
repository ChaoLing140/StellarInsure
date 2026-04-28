export type PolicyStatus = "active" | "pending" | "expired" | "claimed";
export type PolicyType = "weather" | "flight" | "smart-contract" | "asset" | "health";

export interface PolicyFixture {
  id: string;
  title: string;
  type: PolicyType;
  status: PolicyStatus;
  coverageAmount: number;
  premiumAmount: number;
  createdAt: string;
  expiresAt: string;
  oracleSource: string;
}

export const MOCK_POLICIES: PolicyFixture[] = [
  {
    id: "weather-alpha",
    title: "Northern Plains Weather Guard",
    type: "weather",
    status: "active",
    coverageAmount: 5000,
    premiumAmount: 125.5,
    createdAt: "2026-02-15",
    expiresAt: "2026-05-15",
    oracleSource: "NOAA Weather API",
  },
  {
    id: "flight-orbit",
    title: "Flight Orbit Delay Cover",
    type: "flight",
    status: "active",
    coverageAmount: 2000,
    premiumAmount: 45.0,
    createdAt: "2026-03-01",
    expiresAt: "2026-06-01",
    oracleSource: "Airline Delay API",
  },
  {
    id: "smart-contract-alpha",
    title: "Smart Contract Risk Shield",
    type: "smart-contract",
    status: "active",
    coverageAmount: 10000,
    premiumAmount: 250.0,
    createdAt: "2026-01-10",
    expiresAt: "2026-07-10",
    oracleSource: "Ethereum Audit API",
  },
  {
    id: "health-basic",
    title: "Basic Health Coverage",
    type: "health",
    status: "pending",
    coverageAmount: 3000,
    premiumAmount: 75.0,
    createdAt: "2026-04-01",
    expiresAt: "2026-10-01",
    oracleSource: "Health Oracle",
  },
  {
    id: "asset-protection",
    title: "Asset Value Protection",
    type: "asset",
    status: "expired",
    coverageAmount: 8000,
    premiumAmount: 200.0,
    createdAt: "2025-10-01",
    expiresAt: "2026-01-01",
    oracleSource: "Price Feed API",
  },
  {
    id: "weather-coastal",
    title: "Coastal Storm Parametric Cover",
    type: "weather",
    status: "claimed",
    coverageAmount: 12000,
    premiumAmount: 310.0,
    createdAt: "2025-11-15",
    expiresAt: "2026-02-15",
    oracleSource: "NOAA Weather API",
  },
];
