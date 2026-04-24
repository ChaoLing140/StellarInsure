"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/icon";

export interface EligibilityCheck {
  id: string;
  name: string;
  description: string;
  met: boolean;
}

export interface ClaimEligibilityCheckerProps {
  policyId: string;
  claimType: string;
}

const MOCK_ELIGIBILITY_CHECKS: Record<string, EligibilityCheck[]> = {
  flight_delay: [
    {
      id: "active",
      name: "Policy Active",
      description: "Your policy must be active at the time of the incident.",
      met: true,
    },
    {
      id: "coverage",
      name: "Flight Delay Coverage",
      description: "Your policy includes flight delay protection.",
      met: true,
    },
    {
      id: "delay_duration",
      name: "Minimum Delay Duration",
      description: "Delay must exceed 4 hours for coverage.",
      met: true,
    },
    {
      id: "proof",
      name: "Proof of Delay",
      description: "Official airline confirmation or booking confirmation required.",
      met: false,
    },
  ],
  weather: [
    {
      id: "active",
      name: "Policy Active",
      description: "Your policy must be active at the time of the incident.",
      met: true,
    },
    {
      id: "coverage",
      name: "Weather Protection Coverage",
      description: "Your policy includes weather protection.",
      met: true,
    },
    {
      id: "parameters",
      name: "Weather Parameters Met",
      description: "Incident must meet specified weather thresholds.",
      met: true,
    },
    {
      id: "oracle",
      name: "Oracle Confirmation",
      description: "Weather data must be confirmed by our oracle.",
      met: false,
    },
  ],
  crop_failure: [
    {
      id: "active",
      name: "Policy Active",
      description: "Your policy must be active at the time of the incident.",
      met: true,
    },
    {
      id: "coverage",
      name: "Crop Failure Coverage",
      description: "Your policy includes crop failure protection.",
      met: true,
    },
    {
      id: "loss_threshold",
      name: "Loss Threshold",
      description: "Loss must exceed the policy deductible.",
      met: false,
    },
  ],
  parametric: [
    {
      id: "active",
      name: "Policy Active",
      description: "Your policy must be active at the time of the incident.",
      met: true,
    },
    {
      id: "trigger",
      name: "Trigger Conditions",
      description: "Incident must trigger the parametric conditions.",
      met: true,
    },
  ],
};

export function ClaimEligibilityChecker({
  policyId,
  claimType,
}: ClaimEligibilityCheckerProps) {
  const [checks, setChecks] = useState<EligibilityCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkEligibility() {
      setLoading(true);
      setError(null);
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const policyChecks = MOCK_ELIGIBILITY_CHECKS[claimType] || [];
        setChecks(policyChecks);
      } catch (err) {
        setError("Failed to verify eligibility. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (policyId && claimType) {
      checkEligibility();
    }
  }, [policyId, claimType]);

  if (!policyId || !claimType) {
    return null;
  }

  const metCount = checks.filter((c) => c.met).length;
  const totalCount = checks.length;
  const allMet = metCount === totalCount && totalCount > 0;

  return (
    <div className="eligibility-checker" role="region" aria-label="Claim eligibility verification">
      <div className="eligibility-header">
        <Icon name="shield" size="md" tone="accent" />
        <h3 className="eligibility-title">Eligibility Verification</h3>
      </div>

      {error && (
        <div className="eligibility-error" role="alert">
          <Icon name="alert" size="sm" tone="danger" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="eligibility-loading">
          <div className="spinner" aria-label="Checking eligibility" />
          <p>Verifying claim eligibility...</p>
        </div>
      )}

      {!loading && checks.length === 0 && (
        <div className="eligibility-empty">
          <p className="eligibility-empty-text">No eligibility information available</p>
        </div>
      )}

      {!loading && checks.length > 0 && (
        <>
          <div
            className={`eligibility-summary ${allMet ? "eligible" : "ineligible"}`}
            role="status"
          >
            <div className="eligibility-status">
              {allMet ? (
                <>
                  <Icon name="check" size="md" tone="success" />
                  <span className="eligibility-status-text">Ready to submit</span>
                </>
              ) : (
                <>
                  <Icon name="alert" size="md" tone="warning" />
                  <span className="eligibility-status-text">
                    {totalCount - metCount} condition{totalCount - metCount !== 1 ? "s" : ""} pending
                  </span>
                </>
              )}
            </div>
            <div className="eligibility-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(metCount / totalCount) * 100}%` }}
                  role="progressbar"
                  aria-valuenow={metCount}
                  aria-valuemin={0}
                  aria-valuemax={totalCount}
                />
              </div>
              <span className="progress-text">
                {metCount} of {totalCount} requirements met
              </span>
            </div>
          </div>

          <div className="eligibility-checks">
            {checks.map((check) => (
              <div key={check.id} className={`eligibility-check ${check.met ? "met" : "pending"}`}>
                <div className="check-icon">
                  {check.met ? (
                    <Icon name="check" size="md" tone="success" />
                  ) : (
                    <Icon name="close" size="md" tone="warning" />
                  )}
                </div>
                <div className="check-content">
                  <h4 className="check-name">{check.name}</h4>
                  <p className="check-description">{check.description}</p>
                </div>
              </div>
            ))}
          </div>

          {!allMet && (
            <div className="eligibility-note" role="note">
              <Icon name="info" size="sm" tone="muted" />
              <p>Please address the pending requirements before submitting your claim.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
