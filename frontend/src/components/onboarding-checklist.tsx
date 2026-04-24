"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "./icon";

interface ChecklistItem {
    id: string;
    label: string;
    isComplete: boolean;
    description: string;
}

export function OnboardingChecklist() {
    const [items, setItems] = useState<ChecklistItem[]>([
        {
            id: "wallet",
            label: "Connect Wallet",
            description: "Connect your Stellar wallet to get started.",
            isComplete: true, // Mocking as true for demo
        },
        {
            id: "policy",
            label: "First Policy",
            description: "Create your first parametric insurance policy.",
            isComplete: false,
        },
        {
            id: "claim",
            label: "First Claim",
            description: "Submit a claim once a trigger condition is met.",
            isComplete: false,
        },
    ]);

    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const isDismissed = localStorage.getItem("onboarding-checklist-dismissed");
        if (isDismissed) setDismissed(true);
    }, []);

    const handleDismiss = () => {
        localStorage.setItem("onboarding-checklist-dismissed", "true");
        setDismissed(true);
    };

    if (dismissed) return null;

    const completedCount = items.filter((i) => i.isComplete).length;
    const progress = (completedCount / items.length) * 100;

    return (
        <div className="onboarding-checklist-container motion-panel">
            <div className="checklist-header">
                <div className="checklist-title-group">
                    <h3>Getting Started</h3>
                    <p>{completedCount} of {items.length} steps completed</p>
                </div>
                <button className="checklist-close" onClick={handleDismiss} aria-label="Dismiss checklist">
                    <Icon name="close" size="sm" />
                </button>
            </div>

            <div className="checklist-progress-bar">
                <div className="checklist-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="checklist-items">
                {items.map((item) => (
                    <div key={item.id} className={`checklist-item ${item.isComplete ? "complete" : ""}`}>
                        <div className="checklist-item-icon">
                            {item.isComplete ? (
                                <Icon name="check" size="sm" tone="success" />
                            ) : (
                                <div className="checklist-dot" />
                            )}
                        </div>
                        <div className="checklist-item-content">
                            <strong>{item.label}</strong>
                            <p>{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
