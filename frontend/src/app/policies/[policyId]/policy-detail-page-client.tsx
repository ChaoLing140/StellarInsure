"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { AmountInput, formatAssetAmount, parseAmountInput } from "@/components/amount-input";
import { Icon } from "@/components/icon";
import { Skeleton, SkeletonText } from "@/components/skeleton";
import { TransactionModal } from "@/components/transaction-modal";

type PolicyStatus = "Active" | "Claim Pending" | "Claim Approved";
type ClaimStatus = "Approved" | "Pending";
type ContactChannel = "email" | "sms";

type ClaimRecord = {
  id: string;
  submittedAt: string;
  amount: number;
  status: ClaimStatus;
  evidence: string;
};

type PolicyRecord = {
  id: string;
  title: string;
  type: string;
  status: PolicyStatus;
  coverageAmount: number;
  premium: number;
  startDate: string;
  endDate: string;
  triggerCondition: string;
  claimWindow: string;
  payoutDestination: string;
  note: string;
  claims: ClaimRecord[];
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  amount: string;
  preferredChannel: ContactChannel;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_FORM: FormState = {
  fullName: "",
  email: "",
  phone: "",
  amount: "",
  preferredChannel: "email",
  notes: "",
};

const POLICY_RECORDS: Record<string, PolicyRecord | "error"> = {
  "weather-alpha": {
    id: "POL-2026-014",
    title: "Northern Plains Weather Guard",
    type: "Weather protection",
    status: "Claim Approved",
    coverageAmount: 12000,
    premium: 480,
    startDate: "2026-03-01T08:00:00.000Z",
    endDate: "2026-09-01T08:00:00.000Z",
    triggerCondition: "Rainfall below 50mm during the monitored growth window.",
    claimWindow: "Claims can be reviewed automatically until September 3, 2026.",
    payoutDestination: "GCFX...J4F7",
    note: "This policy is optimized for seasonal crop protection and supports automated evidence review.",
    claims: [
      {
        id: "CLM-0091",
        submittedAt: "2026-03-18T14:30:00.000Z",
        amount: 4500,
        status: "Approved",
        evidence: "Rainfall station export and oracle verification bundle",
      },
    ],
  },
  "flight-orbit": {
    id: "POL-2026-021",
    title: "Flight Orbit Delay Cover",
    type: "Flight delay protection",
    status: "Active",
    coverageAmount: 800,
    premium: 24,
    startDate: "2026-03-22T09:00:00.000Z",
    endDate: "2026-04-30T09:00:00.000Z",
    triggerCondition: "Departure delay greater than 120 minutes for the insured itinerary.",
    claimWindow: "No claims submitted yet. Automatic review remains active until the trip concludes.",
    payoutDestination: "GDFK...8A6N",
    note: "Use this page to print the latest policy snapshot or prepare a support handoff while mobile.",
    claims: [],
  },
  "sync-check": "error",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function statusClassName(status: PolicyStatus | ClaimStatus) {
  const key = status.toLowerCase().replace(/\s+/g, "-");
  return `status-pill status-pill--${key}`;
}

function getPolicyRecord(policyId: string) {
  return POLICY_RECORDS[policyId];
}

export default function PolicyDetailPage({
  params,
}: {
  params: { policyId: string };
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [record, setRecord] = useState<PolicyRecord | "error" | null>(null);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success">("idle");
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const summaryId = useId();
  const claimId = useId();
  const assistId = useId();

  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setRecord(null);

    const timer = window.setTimeout(() => {
      const nextRecord = getPolicyRecord(params.policyId);
      setRecord(nextRecord ?? null);
      setIsLoading(false);
    }, 240);

    return () => window.clearTimeout(timer);
  }, [params.policyId]);

  const currentPolicy = useMemo(
    () => (record && record !== "error" ? record : null),
    [record],
  );

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormState((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: undefined }));
  }

  function focusFirstError(errors: FormErrors) {
    const orderedFields: Array<keyof FormState> = [
      "fullName",
      "email",
      "phone",
      "amount",
      "notes",
    ];

    const refs: Record<keyof FormState, HTMLElement | null> = {
      fullName: fullNameRef.current,
      email: emailRef.current,
      phone: phoneRef.current,
      amount: amountRef.current,
      preferredChannel: null,
      notes: notesRef.current,
    };

    const firstField = orderedFields.find((field) => errors[field]);
    if (!firstField) {
      return;
    }

    const element = refs[firstField];
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => element?.focus(), 160);
  }

  function validateForm(policy: PolicyRecord): FormErrors {
    const errors: FormErrors = {};
    const amount = parseAmountInput(formState.amount);

    if (formState.fullName.trim().length < 2) {
      errors.fullName = "Enter the contact name you want support to reference.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
      errors.email = "Enter a valid email address for policy updates.";
    }

    if (formState.phone.replace(/[^\d+]/g, "").length < 7) {
      errors.phone = "Enter a phone number that support can use on mobile.";
    }

    if (amount === null || amount <= 0) {
      errors.amount = "Enter a valid payout review amount.";
    } else if (amount > policy.coverageAmount) {
      errors.amount = "Requested review amount cannot exceed the policy coverage.";
    }

    if (formState.notes.trim().length < 20) {
      errors.notes = "Add a short incident summary so the claim packet is useful when printed.";
    }

    return errors;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentPolicy) {
      return;
    }

    const nextErrors = validateForm(currentPolicy);
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(nextErrors);
      return;
    }

    setSubmitState("submitting");
    window.setTimeout(() => {
      setSubmitState("success");
      setFormState(INITIAL_FORM);
    }, 420);
  }

  if (isLoading) {
    return (
      <main id="main-content" className="policy-page" aria-busy="true">
        <span className="visually-hidden">Loading policy data, please wait.</span>
        <section className="policy-shell">
          {/* Header */}
          <div className="policy-header" style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <Skeleton style={{ width: "80px", height: "12px", marginBottom: "0.75rem" }} />
                <Skeleton style={{ width: "55%", height: "32px", marginBottom: "0.5rem" }} />
                <Skeleton style={{ width: "30%", height: "14px" }} />
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <Skeleton style={{ width: "110px", height: "38px", borderRadius: "8px" }} />
                <Skeleton style={{ width: "110px", height: "38px", borderRadius: "8px" }} />
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="policy-grid" style={{ marginBottom: "2rem" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`metric-sk-${i}`} className="hero-card" style={{ padding: "1.25rem" }}>
                <Skeleton style={{ width: "28px", height: "28px", borderRadius: "50%", marginBottom: "0.75rem" }} />
                <Skeleton style={{ width: "60%", height: "11px", marginBottom: "0.5rem" }} />
                <Skeleton style={{ width: "80%", height: "20px" }} />
              </div>
            ))}
          </div>

          {/* Two-column panel area */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={`panel-sk-${j}`} className="panel" style={{ padding: "1.5rem" }}>
                <Skeleton style={{ width: "40%", height: "14px", marginBottom: "1rem" }} />
                <SkeletonText lines={4} />
              </div>
            ))}
          </div>

          {/* Timeline / claim list rows */}
          <div className="panel" style={{ padding: "1.5rem" }}>
            <Skeleton style={{ width: "35%", height: "14px", marginBottom: "1.25rem" }} />
            {Array.from({ length: 3 }).map((_, k) => (
              <div key={`row-sk-${k}`} style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
                <Skeleton style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <Skeleton style={{ width: "50%", height: "12px", marginBottom: "0.4rem" }} />
                  <Skeleton style={{ width: "30%", height: "10px" }} />
                </div>
                <Skeleton style={{ width: "70px", height: "24px", borderRadius: "20px" }} />
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (record === "error") {
    return (
      <main id="main-content" className="policy-page">
        <section className="policy-shell state-card" role="alert">
          <span className="eyebrow">Policy Detail</span>
          <span className="state-icon" aria-hidden="true">
            <Icon name="alert" size="lg" tone="warning" />
          </span>
          <h1>Policy data is temporarily unavailable</h1>
          <p className="state-copy">
            The latest claim export could not be prepared. Try again from history or open a
            different policy snapshot.
          </p>
          <div className="inline-actions">
            <Link className="cta-primary" href="/history">
              Return to history
            </Link>
            <Link className="cta-secondary" href="/policies/weather-alpha">
              Open sample policy
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!currentPolicy) {
    return (
      <main id="main-content" className="policy-page">
        <section className="policy-shell state-card">
          <span className="eyebrow">Policy Detail</span>
          <span className="state-icon" aria-hidden="true">
            <Icon name="document" size="lg" tone="muted" />
          </span>
          <h1>Policy not found</h1>
          <p className="state-copy">
            This preview does not exist in the current frontend dataset. Open a sample policy to
            validate the detail and print experience.
          </p>
          <div className="inline-actions">
            <Link className="cta-primary" href="/policies/weather-alpha">
              View weather sample
            </Link>
            <Link className="cta-secondary" href="/policies/flight-orbit">
              View flight sample
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main id="main-content" className="policy-page">
      <section className="policy-shell print-shell">
        <header className="section-header policy-header">
          <div>
            <span className="eyebrow">Policy Detail</span>
            <h1>{currentPolicy.title}</h1>
            <p>
              Print-ready policy and claim details with a mobile-friendly assistance form for
              follow-up review.
            </p>
          </div>
          <div className="policy-header__actions print-hidden">
            <button className="cta-primary" type="button" onClick={() => setIsPayModalOpen(true)}>
              Pay Premium
            </button>
            <button className="cta-secondary" type="button" onClick={() => window.print()}>
              Print
            </button>
            <Link className="cta-secondary" href="/history">
              Back to history
            </Link>
          </div>
        </header>

        <div className="policy-grid">
          <section className="hero-card motion-panel" aria-labelledby={summaryId}>
            <div className="policy-summary__header">
              <div>
                <p className="metadata-label">Policy reference</p>
                <div className="policy-summary__title">
                  <Icon name="shield" size="md" tone="accent" />
                  <h2 id={summaryId}>{currentPolicy.id}</h2>
                </div>
              </div>
              <span className={statusClassName(currentPolicy.status)}>{currentPolicy.status}</span>
            </div>

            <dl className="definition-grid">
              <div>
                <dt>Coverage</dt>
                <dd>{formatAssetAmount(currentPolicy.coverageAmount)} XLM</dd>
              </div>
              <div>
                <dt>Premium</dt>
                <dd>{formatAssetAmount(currentPolicy.premium)} XLM</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{currentPolicy.type}</dd>
              </div>
              <div>
                <dt>Destination</dt>
                <dd>{currentPolicy.payoutDestination}</dd>
              </div>
              <div>
                <dt>Start date</dt>
                <dd>{formatDate(currentPolicy.startDate)}</dd>
              </div>
              <div>
                <dt>End date</dt>
                <dd>{formatDate(currentPolicy.endDate)}</dd>
              </div>
            </dl>

            <div className="policy-copy-block">
              <h3>Trigger condition</h3>
              <p>{currentPolicy.triggerCondition}</p>
            </div>

            <div className="policy-copy-block">
              <h3>Claim window</h3>
              <p>{currentPolicy.claimWindow}</p>
            </div>
          </section>

          <aside className="panel motion-panel" aria-labelledby={assistId}>
            <p className="metadata-label">Print note</p>
            <div className="panel-heading">
              <Icon name="document" size="md" tone="accent" />
              <h2 id={assistId}>Export summary</h2>
            </div>
            <p>{currentPolicy.note}</p>
            <ul className="policy-checklist">
              <li>Optimized for A4 and letter print layouts.</li>
              <li>Action controls are automatically hidden when printing.</li>
              <li>Claim evidence and status remain readable in grayscale.</li>
            </ul>
          </aside>
        </div>

        <section className="panel motion-panel" aria-labelledby={claimId}>
          <div className="section-header policy-subsection">
            <span className="eyebrow">Claims</span>
            <h2 id={claimId}>Claim activity</h2>
            <p>Review status history before exporting or sending the policy packet.</p>
          </div>

          {currentPolicy.claims.length === 0 ? (
            <div className="state-card state-card--soft" role="status">
              <span className="state-icon" aria-hidden="true">
                <Icon name="clock" size="lg" tone="muted" />
              </span>
              <h3>No claims filed yet</h3>
              <p className="state-copy">
                This policy is active and ready for automated review, but there are no claim
                records to print yet.
              </p>
            </div>
          ) : (
            <div className="claim-list" role="list" aria-label="Claim history">
              {currentPolicy.claims.map((claim) => (
                <article key={claim.id} className="claim-card" role="listitem">
                  <div className="claim-card__header">
                    <div>
                      <p className="metadata-label">Claim reference</p>
                      <h3>{claim.id}</h3>
                    </div>
                    <span className={statusClassName(claim.status)}>{claim.status}</span>
                  </div>
                  <dl className="definition-grid definition-grid--compact">
                    <div>
                      <dt>Submitted</dt>
                      <dd>{formatDate(claim.submittedAt)}</dd>
                    </div>
                    <div>
                      <dt>Requested amount</dt>
                      <dd>{formatAssetAmount(claim.amount)} XLM</dd>
                    </div>
                    <div>
                      <dt>Evidence bundle</dt>
                      <dd>{claim.evidence}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel motion-panel print-hidden" aria-labelledby="assist-form-title">
          <div className="section-header policy-subsection">
            <span className="eyebrow">Mobile Assistance</span>
            <h2 id="assist-form-title">Prepare a support handoff</h2>
            <p>
              Large tap targets, mobile keyboard hints, and scroll-to-error validation keep the
              form usable on smaller screens.
            </p>
          </div>

          <form className="support-form" noValidate onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field">
                <span className="field__label">Contact name</span>
                <input
                  ref={fullNameRef}
                  autoComplete="name"
                  className="field__input"
                  name="fullName"
                  type="text"
                  value={formState.fullName}
                  onChange={(event) => setField("fullName", event.target.value)}
                  aria-invalid={Boolean(formErrors.fullName)}
                  aria-describedby={formErrors.fullName ? "fullName-error" : undefined}
                />
                {formErrors.fullName ? (
                  <span id="fullName-error" className="field__error">
                    {formErrors.fullName}
                  </span>
                ) : null}
              </label>

              <label className="field">
                <span className="field__label">Update email</span>
                <input
                  ref={emailRef}
                  autoComplete="email"
                  className="field__input"
                  name="email"
                  inputMode="email"
                  type="email"
                  value={formState.email}
                  onChange={(event) => setField("email", event.target.value)}
                  aria-invalid={Boolean(formErrors.email)}
                  aria-describedby={formErrors.email ? "email-error" : undefined}
                />
                {formErrors.email ? (
                  <span id="email-error" className="field__error">
                    {formErrors.email}
                  </span>
                ) : null}
              </label>

              <label className="field">
                <span className="field__label">Mobile number</span>
                <input
                  ref={phoneRef}
                  autoComplete="tel"
                  className="field__input"
                  name="phone"
                  inputMode="tel"
                  type="tel"
                  value={formState.phone}
                  onChange={(event) => setField("phone", event.target.value)}
                  aria-invalid={Boolean(formErrors.phone)}
                  aria-describedby={formErrors.phone ? "phone-error" : undefined}
                />
                {formErrors.phone ? (
                  <span id="phone-error" className="field__error">
                    {formErrors.phone}
                  </span>
                ) : null}
              </label>

              <label className="field">
                <span className="field__label">Review amount</span>
                <AmountInput
                  ref={amountRef}
                  className="field__input"
                  name="amount"
                  value={formState.amount}
                  onChange={(value) => setField("amount", value)}
                  aria-invalid={Boolean(formErrors.amount)}
                  aria-describedby={formErrors.amount ? "amount-error" : "amount-hint"}
                />
                <span id="amount-hint" className="field__hint">
                  Maximum review amount: {formatAssetAmount(currentPolicy.coverageAmount)} XLM
                </span>
                {formErrors.amount ? (
                  <span id="amount-error" className="field__error">
                    {formErrors.amount}
                  </span>
                ) : null}
              </label>
            </div>

            <fieldset className="field fieldset">
              <legend className="field__label">Preferred update channel</legend>
              <div className="choice-row">
                <label className="choice">
                  <input
                    checked={formState.preferredChannel === "email"}
                    name="preferredChannel"
                    type="radio"
                    onChange={() => setField("preferredChannel", "email")}
                  />
                  <span>Email summary</span>
                </label>
                <label className="choice">
                  <input
                    checked={formState.preferredChannel === "sms"}
                    name="preferredChannel"
                    type="radio"
                    onChange={() => setField("preferredChannel", "sms")}
                  />
                  <span>SMS prompt</span>
                </label>
              </div>
            </fieldset>

            <label className="field field--full">
              <span className="field__label">Incident summary</span>
              <textarea
                ref={notesRef}
                autoComplete="off"
                className="field__input field__input--textarea"
                name="notes"
                rows={5}
                value={formState.notes}
                onChange={(event) => setField("notes", event.target.value)}
                aria-invalid={Boolean(formErrors.notes)}
                aria-describedby={formErrors.notes ? "notes-error" : "notes-hint"}
              />
              <span id="notes-hint" className="field__hint">
                Include timing, trigger evidence, and anything that should be visible in print.
              </span>
              {formErrors.notes ? (
                <span id="notes-error" className="field__error">
                  {formErrors.notes}
                </span>
              ) : null}
            </label>

            <div className="form-actions">
              <button className="cta-primary" type="submit" disabled={submitState === "submitting"}>
                {submitState === "submitting" ? "Preparing packet..." : "Save handoff draft"}
              </button>
              <p className="form-status" aria-live="polite" role="status">
                {submitState === "success"
                  ? "Support handoff draft saved for this device."
                  : "Validation errors will scroll into view on mobile before submission."}
              </p>
            </div>
          </form>
        </section>
      </section>

      <TransactionModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        type="premium"
        amount={currentPolicy.premium}
        destination={currentPolicy.payoutDestination}
        onConfirm={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }}
      />
    </main>
  );
}
