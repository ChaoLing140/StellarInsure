"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  DashboardWidget,
  StatMetric,
  ChartContainer,
} from "@/components/dashboard-widget";
import { Icon } from "@/components/icon";

interface AnalyticsData {
  activePolicies: number;
  totalPolicies: number;
  claimsRatio: number;
  claimsProcessed: number;
  totalClaims: number;
  premiumTrend: { month: string; amount: number }[];
  weeklyChange: number;
}

const MOCK_ANALYTICS_DATA: AnalyticsData = {
  activePolicies: 24,
  totalPolicies: 156,
  claimsRatio: 0.85,
  claimsProcessed: 42,
  totalClaims: 49,
  premiumTrend: [
    { month: "Jan", amount: 12500 },
    { month: "Feb", amount: 15200 },
    { month: "Mar", amount: 14800 },
    { month: "Apr", amount: 18900 },
  ],
  weeklyChange: 12.5,
};

export interface DateRange {
  startDate: string;
  endDate: string;
}

const PRESET_RANGES: { label: string; getDates: () => DateRange }[] = [
  {
    label: "Last 30 days",
    getDates: () => {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 30);
      return {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      };
    },
  },
  {
    label: "Last 90 days",
    getDates: () => {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 90);
      return {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      };
    },
  },
  {
    label: "This year",
    getDates: () => {
      const end = new Date();
      return {
        startDate: `${end.getFullYear()}-01-01`,
        endDate: end.toISOString().split("T")[0],
      };
    },
  },
];

function DateRangePicker({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
}) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="analytics-date-picker" role="group" aria-label="Date range filter">
      <div className="analytics-date-presets">
        {PRESET_RANGES.map(({ label, getDates }) => (
          <button
            key={label}
            type="button"
            className="analytics-preset-btn"
            onClick={() => onChange(getDates())}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="analytics-date-inputs">
        <div className="analytics-date-field">
          <label className="analytics-date-label" htmlFor="analytics-start">
            From
          </label>
          <input
            id="analytics-start"
            type="date"
            className="analytics-date-input"
            value={value.startDate}
            max={value.endDate || today}
            onChange={(e) => onChange({ ...value, startDate: e.target.value })}
          />
        </div>
        <span className="analytics-date-separator" aria-hidden="true">
          <Icon name="arrow-up-right" size="sm" tone="muted" />
        </span>
        <div className="analytics-date-field">
          <label className="analytics-date-label" htmlFor="analytics-end">
            To
          </label>
          <input
            id="analytics-end"
            type="date"
            className="analytics-date-input"
            value={value.endDate}
            min={value.startDate}
            max={today}
            onChange={(e) => onChange({ ...value, endDate: e.target.value })}
          />
        </div>
        {(value.startDate || value.endDate) && (
          <button
            type="button"
            className="analytics-date-clear"
            aria-label="Clear date range"
            onClick={() => onChange({ startDate: "", endDate: "" })}
          >
            <Icon name="close" size="sm" tone="muted" />
          </button>
        )}
      </div>
    </div>
  );
}

interface AnalyticsDashboardProps {
  onDataUpdate?: (data: AnalyticsData) => void;
  initialDateRange?: DateRange;
}

function filterTrendByRange(
  trend: AnalyticsData["premiumTrend"],
  range: DateRange
): AnalyticsData["premiumTrend"] {
  if (!range.startDate && !range.endDate) return trend;
  return trend;
}

export function AnalyticsDashboard({ onDataUpdate, initialDateRange }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(
    initialDateRange ?? { startDate: "", endDate: "" }
  );

  const handleDateRangeChange = useCallback(
    (range: DateRange) => {
      setDateRange(range);
    },
    []
  );

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        setData(MOCK_ANALYTICS_DATA);
        onDataUpdate?.(MOCK_ANALYTICS_DATA);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics data");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [onDataUpdate]);

  const filteredTrend = useMemo(
    () => filterTrendByRange(data?.premiumTrend ?? [], dateRange),
    [data, dateRange]
  );

  const successRate = data ? Math.round((data.claimsProcessed / data.totalClaims) * 100) : 0;

  return (
    <div className="analytics-dashboard">
      <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
      <div className="analytics-grid">
        {/* Active Policies Widget */}
        <DashboardWidget
          title="Active Policies"
          description="Currently active coverage"
          icon="shield"
          isLoading={isLoading}
          isError={!!error}
          errorMessage={error || undefined}
        >
          <div className="widget-content">
            <StatMetric
              label="Active Policies"
              value={data?.activePolicies ?? 0}
              change={{
                value: 8,
                isPositive: true,
              }}
            />
            <div className="widget-detail">
              <span className="detail-label">Of Total:</span>
              <span className="detail-value">
                {data?.activePolicies}/{data?.totalPolicies || 0}
              </span>
            </div>
          </div>
        </DashboardWidget>

        {/* Claims Ratio Widget */}
        <DashboardWidget
          title="Claims Success Rate"
          description="Processed vs pending claims"
          icon="verify"
          isLoading={isLoading}
          isError={!!error}
          errorMessage={error || undefined}
        >
          <div className="widget-content">
            <StatMetric
              label="Success Rate"
              value={successRate}
              unit="%"
              change={{
                value: 3.2,
                isPositive: true,
              }}
            />
            <div className="widget-detail">
              <span className="detail-label">Processed:</span>
              <span className="detail-value">
                {data?.claimsProcessed}/{data?.totalClaims || 0}
              </span>
            </div>
          </div>
        </DashboardWidget>

        {/* Premium Trends Widget */}
        <DashboardWidget
          title="Premium Trends"
          description="Monthly premium collection"
          icon="trending-up"
          isLoading={isLoading}
          isError={!!error}
          errorMessage={error || undefined}
        >
          <div className="widget-content">
            <StatMetric
              label="Total Premium (Current)"
              value={data?.premiumTrend[data.premiumTrend.length - 1]?.amount ?? 0}
              unit="USD"
              change={{
                value: data?.weeklyChange ?? 0,
                isPositive: (data?.weeklyChange ?? 0) >= 0,
              }}
            />
            <ChartContainer height="120px">
              <div className="simple-chart">
                {filteredTrend.map((entry) => (
                  <div key={entry.month} className="chart-bar-wrapper">
                    <div
                      className="chart-bar"
                      style={{
                        height: `${(entry.amount / 20000) * 100}%`,
                      }}
                      title={`${entry.month}: $${entry.amount}`}
                    />
                    <span className="chart-label">{entry.month}</span>
                  </div>
                ))}
              </div>
            </ChartContainer>
          </div>
        </DashboardWidget>
      </div>
    </div>
  );
}
