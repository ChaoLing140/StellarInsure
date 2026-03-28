"use client";

import React, { useState } from "react";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { PolicyTypeSelector, type PolicyType } from "@/components/policy-type-selector";
import { TransactionTimeline, DEFAULT_TX_STEPS, type TimelineStep } from "@/components/transaction-timeline";
import { useAutosave } from "@/hooks/use-autosave";

type CreateStep = 0 | 1 | 2 | 3;

interface PolicyDraft {
  policyType: PolicyType | null;
  coverageAmount: string;
  premium: string;
  triggerCondition: string;
  duration: string;
}

const INITIAL_DRAFT: PolicyDraft = {
  policyType: null,
  coverageAmount: "",
  premium: "",
  triggerCondition: "",
  duration: "",
};

const STEP_LABELS = [
  "Select Type",
  "Configure",
  "Review",
  "Submit",
];

function StepIndicator({ current }: { current: CreateStep }) {
  return (
    <nav className="stepper" aria-label="Policy creation steps">
      <ol className="stepper__list">
        {STEP_LABELS.map((label, index) => {
          const isDone = index < current;
          const isActive = index === current;
          return (
            <li
              key={label}
              className={`stepper__item ${isActive ? "stepper__item--active" : ""} ${isDone ? "stepper__item--done" : ""}`}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="stepper__marker" aria-hidden="true">
                {isDone ? (
                  <Icon name="check" size="sm" tone="contrast" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </span>
              <span className="stepper__label">{label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function CreatePolicyPage() {
  const [draft, setDraft, clearDraft] = useAutosave<PolicyDraft>(
    "stellarinsure-policy-draft",
    INITIAL_DRAFT,
  );
  const [step, setStep] = useState<CreateStep>(() => {
    if (draft.policyType && draft.coverageAmount && draft.triggerCondition) return 2;
    if (draft.policyType) return 1;
    return 0;
  });
  const [txSteps, setTxSteps] = useState<TimelineStep[]>(DEFAULT_TX_STEPS);

  function updateDraft<K extends keyof PolicyDraft>(field: K, value: PolicyDraft[K]) {
    setDraft({ ...draft, [field]: value });
  }

  function handleTypeSelect(type: PolicyType) {
    updateDraft("policyType", type);
    setStep(1);
  }

  function handleConfigureNext() {
    setStep(2);
  }

  function handleBack() {
    if (step > 0) {
      setStep((step - 1) as CreateStep);
    }
  }

  function simulateSubmit() {
    setStep(3);

    const updatedSteps = [...DEFAULT_TX_STEPS];
    updatedSteps[0] = { ...updatedSteps[0], status: "active" };
    setTxSteps(updatedSteps);

    setTimeout(() => {
      const next = [...updatedSteps];
      next[0] = { ...next[0], status: "completed" };
      next[1] = { ...next[1], status: "active" };
      setTxSteps(next);
    }, 1200);

    setTimeout(() => {
      const next = [...updatedSteps];
      next[0] = { ...next[0], status: "completed" };
      next[1] = { ...next[1], status: "completed" };
      next[2] = { ...next[2], status: "active" };
      setTxSteps(next);
    }, 2400);

    setTimeout(() => {
      const next = [...updatedSteps];
      next[0] = { ...next[0], status: "completed" };
      next[1] = { ...next[1], status: "completed" };
      next[2] = { ...next[2], status: "completed" };
      setTxSteps(next);
      clearDraft();
    }, 3600);
  }

  const isConfigValid =
    draft.coverageAmount.trim() !== "" &&
    draft.triggerCondition.trim() !== "" &&
    draft.premium.trim() !== "" &&
    draft.duration.trim() !== "";

  return (
    <main id="main-content" className="create-page">
      <div className="section-header">
        <span className="eyebrow">New Policy</span>
        <h1>Create a Policy</h1>
        <p>
          Configure your parametric insurance policy step by step. Your progress is saved
          automatically and will be restored if you leave and return.
        </p>
      </div>

      <StepIndicator current={step} />

      {step === 0 && (
        <section className="create-section motion-panel" aria-labelledby="step-type-title">
          <div className="section-header">
            <h2 id="step-type-title">Choose a Policy Type</h2>
            <p>Select the type of parametric coverage that fits your needs.</p>
          </div>
          <PolicyTypeSelector selected={draft.policyType} onSelect={handleTypeSelect} />
        </section>
      )}

      {step === 1 && (
        <section className="create-section motion-panel" aria-labelledby="step-config-title">
          <div className="section-header">
            <h2 id="step-config-title">Configure Your Policy</h2>
            <p>Set the coverage parameters for your {draft.policyType?.replace("-", " ")} policy.</p>
          </div>

          <div className="form-grid">
            <label className="field">
              <span className="field__label">Coverage Amount (XLM)</span>
              <input
                className="field__input"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="e.g. 5000"
                value={draft.coverageAmount}
                onChange={(e) => updateDraft("coverageAmount", e.target.value)}
              />
              <span className="field__hint">Maximum payout if the trigger condition is met.</span>
            </label>

            <label className="field">
              <span className="field__label">Premium (XLM)</span>
              <input
                className="field__input"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="e.g. 200"
                value={draft.premium}
                onChange={(e) => updateDraft("premium", e.target.value)}
              />
              <span className="field__hint">One-time payment to activate the policy.</span>
            </label>

            <label className="field field--full">
              <span className="field__label">Trigger Condition</span>
              <textarea
                className="field__input field__input--textarea"
                rows={3}
                placeholder="Describe the condition that triggers the payout"
                value={draft.triggerCondition}
                onChange={(e) => updateDraft("triggerCondition", e.target.value)}
              />
              <span className="field__hint">
                The on-chain oracle evaluates this condition automatically.
              </span>
            </label>

            <label className="field">
              <span className="field__label">Duration (days)</span>
              <input
                className="field__input"
                type="number"
                inputMode="numeric"
                min="1"
                placeholder="e.g. 90"
                value={draft.duration}
                onChange={(e) => updateDraft("duration", e.target.value)}
              />
              <span className="field__hint">How long the policy stays active.</span>
            </label>
          </div>

          <div className="form-actions">
            <button className="cta-secondary" type="button" onClick={handleBack}>
              Back
            </button>
            <button
              className="cta-primary"
              type="button"
              disabled={!isConfigValid}
              onClick={handleConfigureNext}
            >
              Continue to Review
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="create-section motion-panel" aria-labelledby="step-review-title">
          <div className="section-header">
            <h2 id="step-review-title">Review Your Policy</h2>
            <p>Confirm the details below before submitting to the Stellar network.</p>
          </div>

          <div className="panel">
            <dl className="definition-grid">
              <div>
                <dt>Policy Type</dt>
                <dd>{draft.policyType?.replace("-", " ")}</dd>
              </div>
              <div>
                <dt>Coverage</dt>
                <dd>{draft.coverageAmount} XLM</dd>
              </div>
              <div>
                <dt>Premium</dt>
                <dd>{draft.premium} XLM</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{draft.duration} days</dd>
              </div>
            </dl>
            <div className="policy-copy-block" style={{ marginTop: "var(--space-4)" }}>
              <h3>Trigger Condition</h3>
              <p>{draft.triggerCondition}</p>
            </div>
          </div>

          <div className="form-actions">
            <button className="cta-secondary" type="button" onClick={handleBack}>
              Back
            </button>
            <button className="cta-primary" type="button" onClick={simulateSubmit}>
              Sign and Submit
            </button>
            <button
              className="cta-secondary"
              type="button"
              onClick={() => {
                clearDraft();
                setStep(0);
              }}
            >
              Discard Draft
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="create-section motion-panel" aria-labelledby="step-submit-title">
          <div className="section-header">
            <h2 id="step-submit-title">Submitting Your Policy</h2>
            <p>Follow the progress of your on-chain transaction below.</p>
          </div>

          <div className="panel">
            <TransactionTimeline steps={txSteps} />
          </div>

          {txSteps.every((s) => s.status === "completed") && (
            <div className="create-success state-card motion-panel" role="status">
              <span className="state-icon" aria-hidden="true">
                <Icon name="check" size="lg" tone="success" />
              </span>
              <h3>Policy Created Successfully</h3>
              <p className="state-copy">
                Your policy has been confirmed on the Stellar network.
              </p>
              <div className="inline-actions">
                <Link className="cta-primary" href="/history">
                  View Transaction History
                </Link>
                <button
                  className="cta-secondary"
                  type="button"
                  onClick={() => {
                    setStep(0);
                    setTxSteps(DEFAULT_TX_STEPS);
                  }}
                >
                  Create Another Policy
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
