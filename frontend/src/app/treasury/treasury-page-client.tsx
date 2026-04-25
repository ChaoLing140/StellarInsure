"use client";

import React, { useState } from "react";
import { WithdrawalFlow, RiskPool } from "@/components/withdrawal-flow";
import { useAppTranslation } from "@/i18n/provider";
import { Icon } from "@/components/icon";

const MOCK_POOLS: RiskPool[] = [
    {
        id: "weather-alpha",
        name: "Weather Alpha Pool",
        balance: 25000,
        cooldownDays: 7,
        currency: "USD",
    },
    {
        id: "flight-beta",
        name: "Flight Delay Beta",
        balance: 1200,
        cooldownDays: 3,
        currency: "USD",
    },
];

export default function TreasuryPageClient() {
    const { t } = useAppTranslation();
    const [selectedPool, setSelectedPool] = useState<RiskPool | null>(null);

    const handleWithdraw = async (amount: number) => {
        // Simulate API call
        return new Promise<void>((resolve) => setTimeout(resolve, 2000));
    };

    return (
        <main id="main-content" tabIndex={-1} className="treasury-page">
            <header className="section-header">
                <span className="eyebrow">Treasury</span>
                <h1>Protocol Liquidity</h1>
                <p>Manage your deposits and initiate withdrawals from risk pools.</p>
            </header>

            {!selectedPool ? (
                <div className="pool-grid feature-grid">
                    {MOCK_POOLS.map((pool) => (
                        <div key={pool.id} className="feature-card glass-panel">
                            <div className="icon-box">
                                <Icon name="shield" size="lg" tone="accent" />
                            </div>
                            <h3>{pool.name}</h3>
                            <p>Current Balance: <strong>${pool.balance.toLocaleString()}</strong></p>
                            <div className="pool-meta">
                                <span>Cooldown: {pool.cooldownDays} days</span>
                            </div>
                            <button
                                className="cta-secondary full-width"
                                onClick={() => setSelectedPool(pool)}
                            >
                                Withdraw Funds
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <WithdrawalFlow
                    pool={selectedPool}
                    onWithdraw={handleWithdraw}
                    onCancel={() => setSelectedPool(null)}
                />
            )}
        </main>
    );
}
