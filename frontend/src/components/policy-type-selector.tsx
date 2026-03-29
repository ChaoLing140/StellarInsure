"use client";

import React from "react";

import { Icon, type IconName } from "./icon";

export type PolicyType = "weather" | "flight" | "smart-contract" | "asset" | "health";

interface PolicyTypeOption {
  id: PolicyType;
  icon: IconName;
  title: string;
  description: string;
}

const POLICY_TYPES: PolicyTypeOption[] = [
  {
    id: "weather",
    icon: "shield",
    title: "Weather Protection",
    description: "Coverage against adverse weather events such as drought, floods, or storms.",
  },
  {
    id: "flight",
    icon: "clock",
    title: "Flight Delay",
    description: "Automatic payout when your flight is delayed beyond the insured threshold.",
  },
  {
    id: "smart-contract",
    icon: "spark",
    title: "Smart Contract",
    description: "Protection against smart contract failures, exploits, or unexpected behavior.",
  },
  {
    id: "asset",
    icon: "wallet",
    title: "Asset Protection",
    description: "Coverage for digital asset value drops triggered by on-chain oracle data.",
  },
  {
    id: "health",
    icon: "heart",
    title: "Health",
    description: "Parametric health coverage with automated claim verification and payout.",
  },
];

interface PolicyTypeSelectorProps {
  selected: PolicyType | null;
  onSelect: (type: PolicyType) => void;
}

export function PolicyTypeSelector({ selected, onSelect }: PolicyTypeSelectorProps) {
  return (
    <div className="policy-type-grid" role="radiogroup" aria-label="Select a policy type">
      {POLICY_TYPES.map((option) => {
        const isSelected = selected === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`policy-type-card ${isSelected ? "policy-type-card--selected" : ""}`}
            onClick={() => onSelect(option.id)}
          >
            <span className="policy-type-card__icon">
              <Icon name={option.icon} size="md" tone={isSelected ? "contrast" : "accent"} />
            </span>
            <h3>{option.title}</h3>
            <p>{option.description}</p>
          </button>
        );
      })}
    </div>
  );
}
