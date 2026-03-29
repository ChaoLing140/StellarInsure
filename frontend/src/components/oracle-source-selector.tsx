"use client";

import React from "react";

import { Icon } from "@/components/icon";

export type OracleProviderState = "loading" | "ready" | "empty" | "error";

export interface OracleProvider {
  id: string;
  name: string;
  network: string;
  confidence: number;
  latency: string;
  fallbackTo?: string;
}

interface OracleSourceSelectorProps {
  state: OracleProviderState;
  providers: OracleProvider[];
  selectedId: string | null;
  onSelect: (providerId: string) => void;
  onRetry?: () => void;
}

function confidenceTone(confidence: number): "high" | "medium" | "low" {
  if (confidence >= 90) {
    return "high";
  }

  if (confidence >= 75) {
    return "medium";
  }

  return "low";
}

export function OracleSourceSelector({
  state,
  providers,
  selectedId,
  onSelect,
  onRetry,
}: OracleSourceSelectorProps) {
  if (state === "loading") {
    return (
      <div className="oracle-state oracle-state--loading" role="status" aria-live="polite">
        <span className="oracle-state__icon" aria-hidden="true">
          <Icon name="clock" size="md" tone="accent" />
        </span>
        <p>Loading oracle providers and confidence signals...</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="oracle-state oracle-state--error" role="alert">
        <span className="oracle-state__icon" aria-hidden="true">
          <Icon name="alert" size="md" tone="warning" />
        </span>
        <div>
          <p>Oracle feeds are currently unavailable.</p>
          <p className="oracle-state__hint">Retry to load available providers and fallback routing.</p>
        </div>
        {onRetry ? (
          <button className="cta-secondary" type="button" onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>
    );
  }

  if (state === "empty" || providers.length === 0) {
    return (
      <div className="oracle-state oracle-state--empty" role="status">
        <span className="oracle-state__icon" aria-hidden="true">
          <Icon name="document" size="md" tone="muted" />
        </span>
        <p>No oracle providers are currently available for this policy type.</p>
      </div>
    );
  }

  const selectedProvider = providers.find((provider) => provider.id === selectedId);

  return (
    <div className="oracle-selector" role="radiogroup" aria-label="Oracle source selector">
      {providers.map((provider) => {
        const tone = confidenceTone(provider.confidence);
        const isSelected = provider.id === selectedId;

        return (
          <label
            key={provider.id}
            className={`oracle-card ${isSelected ? "oracle-card--selected" : ""}`}
          >
            <input
              checked={isSelected}
              className="oracle-card__input"
              name="oracle-provider"
              type="radio"
              value={provider.id}
              onChange={() => onSelect(provider.id)}
            />
            <span className="oracle-card__header">
              <span>
                <strong>{provider.name}</strong>
                <span>{provider.network}</span>
              </span>
              <span className={`oracle-confidence oracle-confidence--${tone}`}>
                {provider.confidence}% confidence
              </span>
            </span>
            <span className="oracle-card__meta">
              <span>Latency: {provider.latency}</span>
              <span>{provider.fallbackTo ? `Fallback: ${provider.fallbackTo}` : "Fallback not configured"}</span>
            </span>
          </label>
        );
      })}

      {selectedProvider?.fallbackTo ? (
        <p className="oracle-fallback" role="status" aria-live="polite">
          If {selectedProvider.name} confidence drops, StellarInsure automatically routes trigger
          verification to {selectedProvider.fallbackTo}.
        </p>
      ) : (
        <p className="oracle-fallback oracle-fallback--warning" role="status" aria-live="polite">
          No fallback provider is configured for this source.
        </p>
      )}
    </div>
  );
}
