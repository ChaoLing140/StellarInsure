"use client";

type MetricsDatum = { label: string; value: number };

const PREMIUMS: MetricsDatum[] = [
  { label: "Jan", value: 12000 },
  { label: "Feb", value: 15400 },
  { label: "Mar", value: 14100 },
  { label: "Apr", value: 17800 },
];

const PAYOUTS: MetricsDatum[] = [
  { label: "Weather", value: 8 },
  { label: "Flight", value: 5 },
  { label: "DeFi", value: 3 },
  { label: "Asset", value: 6 },
];

function maxValue(items: MetricsDatum[]): number {
  return Math.max(...items.map((item) => item.value), 1);
}

export function PolicyMetricsCharts({
  loading = false,
  error = false,
}: {
  loading?: boolean;
  error?: boolean;
}) {
  if (loading) return <div className="panel">Loading policy metrics...</div>;
  if (error) return <div className="panel">Unable to load policy metrics.</div>;
  if (PREMIUMS.length === 0 || PAYOUTS.length === 0) return <div className="panel">No policy metrics yet.</div>;

  const premiumMax = maxValue(PREMIUMS);
  const payoutMax = maxValue(PAYOUTS);

  return (
    <section className="feature-grid" aria-label="Policy metrics charts">
      <article className="panel" aria-labelledby="premiums-chart-title">
        <h3 id="premiums-chart-title">Premium Trend (Line)</h3>
        <svg viewBox="0 0 320 160" role="img" aria-label="Line chart of monthly premium volume">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            points={PREMIUMS.map((item, index) => `${index * 95 + 16},${140 - (item.value / premiumMax) * 110}`).join(" ")}
          />
          {PREMIUMS.map((item, index) => (
            <circle
              key={item.label}
              cx={index * 95 + 16}
              cy={140 - (item.value / premiumMax) * 110}
              r="4"
            />
          ))}
        </svg>
        <table className="chart-data-table" aria-label="Premium trend data">
          <thead>
            <tr>
              <th>Month</th>
              <th>Premium (XLM)</th>
            </tr>
          </thead>
          <tbody>
            {PREMIUMS.map((item) => (
              <tr key={item.label}>
                <td>{item.label}</td>
                <td>{item.value.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
      <article className="panel" aria-labelledby="payouts-chart-title">
        <h3 id="payouts-chart-title">Payouts by Policy (Bar)</h3>
        <div className="chart-bars">
          {PAYOUTS.map((item) => (
            <div key={item.label} className="chart-bar-row">
              <span>{item.label}</span>
              <div className="chart-bar-track">
                <div
                  className="chart-bar-fill"
                  style={{ width: `${(item.value / payoutMax) * 100}%` }}
                  aria-label={`${item.label} payouts ${item.value}`}
                />
              </div>
            </div>
          ))}
        </div>
        <table className="chart-data-table" aria-label="Payout distribution data">
          <thead>
            <tr>
              <th>Policy Type</th>
              <th>Payouts</th>
            </tr>
          </thead>
          <tbody>
            {PAYOUTS.map((item) => (
              <tr key={item.label}>
                <td>{item.label}</td>
                <td>{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
