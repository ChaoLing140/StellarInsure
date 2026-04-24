"use client";

import React, { useState } from "react";
import { Icon } from "@/components/icon";

export type ClaimType = "flight_delay" | "weather" | "crop_failure" | "parametric";

export interface ClaimEvidence {
  type: string;
  description: string;
  fileUrl?: string;
}

export interface ClaimFormData {
  policyId: string;
  claimType: ClaimType;
  incidentDate: string;
  description: string;
  evidenceList: ClaimEvidence[];
  estimatedLoss: string;
}

interface ClaimSubmissionFormProps {
  policyId?: string;
  onSubmit: (data: ClaimFormData) => Promise<void>;
  onCancel?: () => void;
}

const CLAIM_TYPE_LABELS: Record<ClaimType, string> = {
  flight_delay: "Flight Delay",
  weather: "Adverse Weather",
  crop_failure: "Crop Failure",
  parametric: "Parametric Trigger",
};

const EVIDENCE_TYPES = [
  "Official Report",
  "Sensor Data",
  "Transaction Record",
  "Photo / Video",
  "Third-party Attestation",
];

const EMPTY_EVIDENCE: ClaimEvidence = { type: EVIDENCE_TYPES[0], description: "" };

function EvidenceRow({
  index,
  evidence,
  onChange,
  onRemove,
  removable,
}: {
  index: number;
  evidence: ClaimEvidence;
  onChange: (index: number, updates: Partial<ClaimEvidence>) => void;
  onRemove: (index: number) => void;
  removable: boolean;
}) {
  return (
    <div className="claim-evidence-row">
      <select
        className="claim-input claim-input--select"
        value={evidence.type}
        onChange={(e) => onChange(index, { type: e.target.value })}
        aria-label={`Evidence type ${index + 1}`}
      >
        {EVIDENCE_TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <input
        className="claim-input claim-input--text claim-input--grow"
        type="text"
        placeholder="Describe this evidence…"
        value={evidence.description}
        onChange={(e) => onChange(index, { description: e.target.value })}
        aria-label={`Evidence description ${index + 1}`}
      />
      {removable && (
        <button
          type="button"
          className="claim-btn-icon"
          onClick={() => onRemove(index)}
          aria-label="Remove evidence"
        >
          <Icon name="close" size="sm" tone="muted" />
        </button>
      )}
    </div>
  );
}

export function ClaimSubmissionForm({
  policyId = "",
  onSubmit,
  onCancel,
}: ClaimSubmissionFormProps) {
  const [formData, setFormData] = useState<ClaimFormData>({
    policyId,
    claimType: "flight_delay",
    incidentDate: "",
    description: "",
    evidenceList: [{ ...EMPTY_EVIDENCE }],
    estimatedLoss: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  function setField<K extends keyof ClaimFormData>(key: K, value: ClaimFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function updateEvidence(index: number, updates: Partial<ClaimEvidence>) {
    setFormData((prev) => {
      const next = [...prev.evidenceList];
      next[index] = { ...next[index], ...updates };
      return { ...prev, evidenceList: next };
    });
  }

  function addEvidence() {
    setFormData((prev) => ({
      ...prev,
      evidenceList: [...prev.evidenceList, { ...EMPTY_EVIDENCE }],
    }));
  }

  function removeEvidence(index: number) {
    setFormData((prev) => ({
      ...prev,
      evidenceList: prev.evidenceList.filter((_, i) => i !== index),
    }));
  }

  const isValid =
    formData.policyId.trim() &&
    formData.incidentDate &&
    formData.description.trim().length >= 20 &&
    formData.estimatedLoss.trim() &&
    !isNaN(Number(formData.estimatedLoss));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || status === "loading") return;
    setStatus("loading");
    setErrorMessage(null);
    try {
      await onSubmit(formData);
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Claim submission failed. Please try again."
      );
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <div className="claim-form-success">
        <Icon name="check" size="lg" tone="success" />
        <h3 className="claim-success-title">Claim Submitted</h3>
        <p className="claim-success-body">
          Your claim for policy <strong>{formData.policyId}</strong> has been received. You will be
          notified once it is reviewed.
        </p>
      </div>
    );
  }

  return (
    <form className="claim-submission-form" onSubmit={handleSubmit} noValidate>
      <div className="claim-form-header">
        <Icon name="document" size="md" tone="accent" />
        <h2 className="claim-form-title">Submit a Claim</h2>
      </div>

      <div className="claim-form-body">
        {/* Policy ID */}
        <div className="claim-field">
          <label className="claim-label" htmlFor="claim-policy-id">
            Policy ID
          </label>
          <input
            id="claim-policy-id"
            className="claim-input claim-input--text"
            type="text"
            placeholder="e.g. POL-2024-00123"
            value={formData.policyId}
            onChange={(e) => setField("policyId", e.target.value)}
            required
          />
        </div>

        {/* Claim Type */}
        <div className="claim-field">
          <label className="claim-label" htmlFor="claim-type">
            Claim Type
          </label>
          <select
            id="claim-type"
            className="claim-input claim-input--select"
            value={formData.claimType}
            onChange={(e) => setField("claimType", e.target.value as ClaimType)}
          >
            {(Object.keys(CLAIM_TYPE_LABELS) as ClaimType[]).map((key) => (
              <option key={key} value={key}>
                {CLAIM_TYPE_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        {/* Incident Date */}
        <div className="claim-field">
          <label className="claim-label" htmlFor="claim-incident-date">
            Incident Date
          </label>
          <input
            id="claim-incident-date"
            className="claim-input claim-input--text"
            type="date"
            value={formData.incidentDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setField("incidentDate", e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="claim-field">
          <label className="claim-label" htmlFor="claim-description">
            Description{" "}
            <span className="claim-label-hint">(min 20 characters)</span>
          </label>
          <textarea
            id="claim-description"
            className="claim-input claim-input--textarea"
            rows={4}
            placeholder="Describe the incident and how it triggered your policy conditions…"
            value={formData.description}
            onChange={(e) => setField("description", e.target.value)}
            required
          />
          <span className="claim-char-count">{formData.description.length} / 500</span>
        </div>

        {/* Estimated Loss */}
        <div className="claim-field">
          <label className="claim-label" htmlFor="claim-loss">
            Estimated Loss (USD)
          </label>
          <input
            id="claim-loss"
            className="claim-input claim-input--text"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={formData.estimatedLoss}
            onChange={(e) => setField("estimatedLoss", e.target.value)}
            required
          />
        </div>

        {/* Evidence */}
        <div className="claim-field">
          <div className="claim-label-row">
            <span className="claim-label">Supporting Evidence</span>
            <button
              type="button"
              className="claim-btn-link"
              onClick={addEvidence}
            >
              <Icon name="plus" size="sm" tone="accent" />
              Add
            </button>
          </div>
          <div className="claim-evidence-list">
            {formData.evidenceList.map((ev, i) => (
              <EvidenceRow
                key={i}
                index={i}
                evidence={ev}
                onChange={updateEvidence}
                onRemove={removeEvidence}
                removable={formData.evidenceList.length > 1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Inline Preview */}
      {showPreview && (
        <div className="claim-preview" role="region" aria-label="Claim preview">
          <h4 className="claim-preview-title">Preview</h4>
          <dl className="claim-preview-grid">
            <dt>Policy</dt>
            <dd>{formData.policyId || "—"}</dd>
            <dt>Type</dt>
            <dd>{CLAIM_TYPE_LABELS[formData.claimType]}</dd>
            <dt>Date</dt>
            <dd>{formData.incidentDate || "—"}</dd>
            <dt>Loss</dt>
            <dd>${Number(formData.estimatedLoss || 0).toLocaleString()}</dd>
            <dt>Evidence</dt>
            <dd>{formData.evidenceList.length} item(s)</dd>
          </dl>
        </div>
      )}

      {errorMessage && (
        <p className="claim-error" role="alert">
          <Icon name="alert" size="sm" tone="danger" />
          {errorMessage}
        </p>
      )}

      <div className="claim-form-actions">
        <button
          type="button"
          className="claim-btn claim-btn--ghost"
          onClick={() => setShowPreview((v) => !v)}
        >
          {showPreview ? "Hide Preview" : "Preview"}
        </button>
        {onCancel && (
          <button
            type="button"
            className="claim-btn claim-btn--ghost"
            onClick={onCancel}
            disabled={status === "loading"}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="claim-btn claim-btn--primary"
          disabled={!isValid || status === "loading"}
        >
          {status === "loading" ? "Submitting…" : "Submit Claim"}
        </button>
      </div>
    </form>
  );
}
