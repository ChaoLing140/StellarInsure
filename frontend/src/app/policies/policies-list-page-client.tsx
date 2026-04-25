"use client";

import React, {
  startTransition,
  useEffect,
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import Link from "next/link";

import { Icon, type IconName } from "@/components/icon";
import { Skeleton } from "@/components/skeleton";
import { StatusPill } from "@/components/status-pill";
import { PolicyTable } from "@/components/policy-table";
import { useAppTranslation } from "@/i18n/provider";
import { useOptimisticList } from "@/hooks/use-optimistic-list";

type PolicyStatus = "active" | "pending" | "expired" | "claimed" | "all";
type PolicyType =
  | "weather"
  | "flight"
  | "smart-contract"
  | "asset"
  | "health"
  | "all";
type SortBy = "date" | "coverage";

interface FilterState {
  statusFilter: PolicyStatus;
  typeFilter: PolicyType;
  sortBy: SortBy;
  minCoverage: number;
  maxCoverage: number;
  startDate: string;
  endDate: string;
}

interface Policy {
  id: string;
  title: string;
  type: PolicyType;
  status: Exclude<PolicyStatus, "all">;
  coverageAmount: number;
  premiumAmount: number;
  createdAt: string;
  expiresAt: string;
  oracleSource: string;
}

const MOCK_POLICIES: Policy[] = [
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
];

const POLICY_TYPE_DISPLAY: Record<
  PolicyType,
  { label: string; icon: IconName }
> = {
  weather: { label: "Weather", icon: "shield" },
  flight: { label: "Flight Delay", icon: "clock" },
  "smart-contract": { label: "Smart Contract", icon: "spark" },
  asset: { label: "Asset Protection", icon: "wallet" },
  health: { label: "Health", icon: "heart" },
  all: { label: "All Types", icon: "shield" },
};

const POLICY_STATUS_DISPLAY: Record<
  Exclude<PolicyStatus, "all">,
  { label: string; tone: "success" | "warning" | "danger" }
> = {
  active: { label: "Active", tone: "success" },
  pending: { label: "Pending", tone: "warning" },
  claimed: { label: "Claimed", tone: "success" },
  expired: { label: "Expired", tone: "danger" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// Internal StatusBadge removed in favor of StatusPill

function PolicyCard({
  policy,
  optimisticStatus = "confirmed",
  onDismissError,
}: {
  policy: Policy;
  optimisticStatus?: "confirmed" | "pending" | "error";
  onDismissError?: () => void;
}) {
  const typeDisplay = POLICY_TYPE_DISPLAY[policy.type as PolicyType];

  return (
    <Link
      href={optimisticStatus === "pending" ? "#" : `/policies/${policy.id}`}
      className={`policy-card motion-panel${optimisticStatus === "pending" ? " policy-card--optimistic" : ""}${optimisticStatus === "error" ? " policy-card--error" : ""}`}
      aria-busy={optimisticStatus === "pending"}
    >
      <article className="policy-card__inner">
        {optimisticStatus === "pending" && (
          <div className="policy-card__optimistic-badge" aria-live="polite">
            <Icon name="clock" size="sm" tone="warning" aria-hidden="true" />
            <span>Saving…</span>
          </div>
        )}
        {optimisticStatus === "error" && (
          <div
            className="policy-card__optimistic-badge policy-card__optimistic-badge--error"
            aria-live="polite"
          >
            <Icon name="alert" size="sm" tone="danger" aria-hidden="true" />
            <span>Failed to save</span>
            {onDismissError && (
              <button
                className="policy-card__dismiss-error"
                onClick={(e) => {
                  e.preventDefault();
                  onDismissError();
                }}
                aria-label="Dismiss error"
              >
                <Icon name="close" size="sm" tone="danger" />
              </button>
            )}
          </div>
        )}
        <div className="policy-card__header">
          <div className="policy-card__title-group">
            <h3>{policy.title}</h3>
            <StatusPill status={policy.status as any} />
          </div>
          <div className="policy-card__icon">
            <Icon name={typeDisplay.icon} size="md" tone="accent" />
          </div>
        </div>

        <div className="policy-card__details">
          <div className="policy-card__detail-row">
            <span className="policy-card__label">Coverage</span>
            <span className="policy-card__value">
              {formatCurrency(policy.coverageAmount)}
            </span>
          </div>
          <div className="policy-card__detail-row">
            <span className="policy-card__label">Premium</span>
            <span className="policy-card__value">
              {formatCurrency(policy.premiumAmount)}
            </span>
          </div>
        </div>

        <div className="policy-card__footer">
          <div className="policy-card__meta">
            <span className="policy-card__type-badge">
              <Icon name={typeDisplay.icon} size="sm" tone="muted" />
              {typeDisplay.label}
            </span>
            <span className="policy-card__date">
              {formatDate(policy.createdAt)}
            </span>
          </div>
          <span className="policy-card__cta" aria-hidden="true">
            <Icon name="arrow-up-right" size="sm" tone="accent" />
          </span>
        </div>
      </article>
    </Link>
  );
}

export default function PoliciesListPageClient() {
  const { t } = useAppTranslation();
  const [statusFilter, setStatusFilter] = useState<PolicyStatus>("all");
  const [typeFilter, setTypeFilter] = useState<PolicyType>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [minCoverage, setMinCoverage] = useState<number>(0);
  const [maxCoverage, setMaxCoverage] = useState<number>(50000);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isLoading, setIsLoading] = useState(true);

  // Optimistic list — new policies appear immediately before server confirmation
  const {
    items: optimisticPolicies,
    addOptimistic,
    confirmItem,
    rejectItem,
    removeItem,
  } = useOptimisticList<Policy>(MOCK_POLICIES);

  const deferredStatusFilter = useDeferredValue(statusFilter);
  const deferredTypeFilter = useDeferredValue(typeFilter);
  const deferredSortBy = useDeferredValue(sortBy);
  const deferredMinCoverage = useDeferredValue(minCoverage);
  const deferredMaxCoverage = useDeferredValue(maxCoverage);
  const deferredStartDate = useDeferredValue(startDate);
  const deferredEndDate = useDeferredValue(endDate);

  const isFiltering =
    deferredStatusFilter !== statusFilter ||
    deferredTypeFilter !== typeFilter ||
    deferredSortBy !== sortBy ||
    deferredMinCoverage !== minCoverage ||
    deferredMaxCoverage !== maxCoverage ||
    deferredStartDate !== startDate ||
    deferredEndDate !== endDate;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return optimisticPolicies.filter((entry) => {
      const policy = entry.data;
      const matchStatus =
        deferredStatusFilter === "all" ||
        policy.status === deferredStatusFilter;
      const matchType =
        deferredTypeFilter === "all" || policy.type === deferredTypeFilter;
      const matchCoverage =
        policy.coverageAmount >= deferredMinCoverage &&
        policy.coverageAmount <= deferredMaxCoverage;

      let matchDateRange = true;
      if (deferredStartDate) {
        matchDateRange =
          matchDateRange &&
          new Date(policy.createdAt) >= new Date(deferredStartDate);
      }
      if (deferredEndDate) {
        matchDateRange =
          matchDateRange &&
          new Date(policy.createdAt) <= new Date(deferredEndDate);
      }

      return matchStatus && matchType && matchCoverage && matchDateRange;
    });
  }, [
    optimisticPolicies,
    deferredStatusFilter,
    deferredTypeFilter,
    deferredMinCoverage,
    deferredMaxCoverage,
    deferredStartDate,
    deferredEndDate,
  ]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (deferredSortBy === "date") {
      copy.sort(
        (a, b) =>
          new Date(b.data.createdAt).getTime() -
          new Date(a.data.createdAt).getTime(),
      );
    } else if (deferredSortBy === "coverage") {
      copy.sort((a, b) => b.data.coverageAmount - a.data.coverageAmount);
    }
    return copy;
  }, [filtered, deferredSortBy]);

  function handleStatusChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as PolicyStatus;
    startTransition(() => {
      setStatusFilter(value);
    });
  }

  function handleTypeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as PolicyType;
    startTransition(() => {
      setTypeFilter(value);
    });
  }

  function handleSortChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as SortBy;
    startTransition(() => {
      setSortBy(value);
    });
  }

  function handleMinCoverageChange(event: React.ChangeEvent<HTMLInputElement>) {
    startTransition(() => {
      setMinCoverage(Number(event.target.value) || 0);
    });
  }

  function handleMaxCoverageChange(event: React.ChangeEvent<HTMLInputElement>) {
    startTransition(() => {
      setMaxCoverage(Number(event.target.value) || 50000);
    });
  }

  function handleStartDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    startTransition(() => {
      setStartDate(event.target.value);
    });
  }

  function handleEndDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    startTransition(() => {
      setEndDate(event.target.value);
    });
  }

  return (
    <main id="main-content" tabIndex={-1} className="policy-page">
      <div className="section-header">
        <span className="eyebrow">{t("policyList.eyebrow")}</span>
        <h1 id="policies-title">{t("policyList.title")}</h1>
        <p>{t("policyList.desc")}</p>
        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <Icon name="grid-3x3" size="sm" />
          </button>
          <button
            className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
            onClick={() => setViewMode("table")}
            aria-label="Table view"
          >
            <Icon name="list" size="sm" />
          </button>
        </div>
      </div>

      <div
        className="policy-filters motion-panel"
        role="search"
        aria-label="Filter and sort policies"
      >
        <div className="policy-filter-group">
          <label htmlFor="status-filter" className="policy-filter-label">
            {t("policies.filters.status")}
          </label>
          <select
            id="status-filter"
            className="policy-select"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="all">{t("policies.filters.allStatuses")}</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="claimed">Claimed</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="policy-filter-group">
          <label htmlFor="type-filter" className="policy-filter-label">
            {t("policies.filters.type")}
          </label>
          <select
            id="type-filter"
            className="policy-select"
            value={typeFilter}
            onChange={handleTypeChange}
          >
            <option value="all">{t("policies.filters.allTypes")}</option>
            <option value="weather">Weather</option>
            <option value="flight">Flight Delay</option>
            <option value="smart-contract">Smart Contract</option>
            <option value="asset">Asset Protection</option>
            <option value="health">Health</option>
          </select>
        </div>

        <div className="policy-filter-group">
          <label htmlFor="start-date-filter" className="policy-filter-label">
            {t("policies.filters.startDate")}
          </label>
          <input
            id="start-date-filter"
            type="date"
            className="policy-select"
            value={startDate}
            onChange={handleStartDateChange}
          />
        </div>

        <div className="policy-filter-group">
          <label htmlFor="end-date-filter" className="policy-filter-label">
            {t("policies.filters.endDate")}
          </label>
          <input
            id="end-date-filter"
            type="date"
            className="policy-select"
            value={endDate}
            onChange={handleEndDateChange}
          />
        </div>

        <div className="policy-filter-group">
          <label htmlFor="min-coverage-filter" className="policy-filter-label">
            {t("policies.filters.minCoverage")}
          </label>
          <input
            id="min-coverage-filter"
            type="number"
            className="policy-select"
            value={minCoverage}
            onChange={handleMinCoverageChange}
            min="0"
            step="100"
          />
        </div>

        <div className="policy-filter-group">
          <label htmlFor="max-coverage-filter" className="policy-filter-label">
            {t("policies.filters.maxCoverage")}
          </label>
          <input
            id="max-coverage-filter"
            type="number"
            className="policy-select"
            value={maxCoverage}
            onChange={handleMaxCoverageChange}
            min="0"
            step="100"
          />
        </div>

        <div className="policy-filter-group">
          <label htmlFor="sort-filter" className="policy-filter-label">
            {t("policies.filters.sortBy")}
          </label>
          <select
            id="sort-filter"
            className="policy-select"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="date">{t("policies.filters.newestFirst")}</option>
            <option value="coverage">
              {t("policies.filters.highestCoverage")}
            </option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div
          className="policy-grid motion-panel"
          role="region"
          aria-label="Loading policies"
          aria-busy="true"
        >
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={`sk-${i}`} className="policy-card--skeleton">
              <Skeleton
                style={{ height: "24px", width: "100%", marginBottom: "12px" }}
              />
              <Skeleton
                style={{ height: "16px", width: "80%", marginBottom: "16px" }}
              />
              <Skeleton
                style={{ height: "14px", width: "60%", marginBottom: "8px" }}
              />
              <Skeleton style={{ height: "14px", width: "70%" }} />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="policy-empty" role="status">
          <span className="policy-empty-icon" aria-hidden="true">
            <Icon name="document" size="lg" tone="muted" />
          </span>
          <h2>{t("policies.empty.title")}</h2>
          <p>{t("policies.empty.message")}</p>
          <Link href="/create" className="cta-secondary">
            {t("policies.empty.cta")}
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        <div
          className={`policy-grid motion-panel ${isFiltering ? "policy-grid--loading" : ""}`}
        >
          {sorted.map((entry) => (
            <PolicyCard
              key={entry.data.id}
              policy={entry.data}
              optimisticStatus={entry.optimisticStatus}
              onDismissError={
                entry.optimisticStatus === "error"
                  ? () => removeItem(entry.data.id)
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div
          className={`policy-table-view motion-panel ${isFiltering ? "policy-grid--loading" : ""}`}
        >
          <PolicyTable policies={sorted.map((e) => e.data) as any} />
        </div>
      )}
    </main>
  );
}
