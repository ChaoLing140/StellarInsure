"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "./icon";
import { StatusPill, type PolicyStatus } from "./status-pill";

export interface Policy {
    id: string;
    title: string;
    type: string;
    status: PolicyStatus;
    coverageAmount: number;
    premiumAmount: number;
    createdAt: string;
    expiresAt: string;
    oracleSource: string;
}

interface PolicyTableProps {
    policies: Policy[];
    isLoading?: boolean;
}

type SortField = "id" | "premium" | "coverage" | "expiry" | "status";
type SortOrder = "asc" | "desc";

export function PolicyTable({ policies, isLoading }: PolicyTableProps) {
    const [sortField, setSortField] = useState<SortField>("id");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

    const sortedPolicies = useMemo(() => {
        const copy = [...policies];
        copy.sort((a, b) => {
            let valA: any = "";
            let valB: any = "";

            switch (sortField) {
                case "id":
                    valA = a.id;
                    valB = b.id;
                    break;
                case "premium":
                    valA = a.premiumAmount;
                    valB = b.premiumAmount;
                    break;
                case "coverage":
                    valA = a.coverageAmount;
                    valB = b.coverageAmount;
                    break;
                case "expiry":
                    valA = new Date(a.expiresAt).getTime();
                    valB = new Date(b.expiresAt).getTime();
                    break;
                case "status":
                    valA = a.status;
                    valB = b.status;
                    break;
            }

            if (valA < valB) return sortOrder === "asc" ? -1 : 1;
            if (valA > valB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
        return copy;
    }, [policies, sortField, sortOrder]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <Icon name="chevron-up-down" size="sm" tone="muted" />;
        return sortOrder === "asc" ? (
            <Icon name="chevron-up" size="sm" tone="accent" />
        ) : (
            <Icon name="chevron-down" size="sm" tone="accent" />
        );
    };

    if (isLoading) {
        return <div className="policy-table-loading">Loading policies...</div>;
    }

    if (policies.length === 0) {
        return <div className="policy-table-empty">No policies found.</div>;
    }

    return (
        <div className="tx-table-wrapper">
            <table className="tx-table">
                <thead>
                    <tr>
                        <th onClick={() => toggleSort("id")} style={{ cursor: "pointer" }}>
                            Policy ID <SortIcon field="id" />
                        </th>
                        <th onClick={() => toggleSort("premium")} style={{ cursor: "pointer" }}>
                            Premium <SortIcon field="premium" />
                        </th>
                        <th onClick={() => toggleSort("coverage")} style={{ cursor: "pointer" }}>
                            Coverage <SortIcon field="coverage" />
                        </th>
                        <th onClick={() => toggleSort("expiry")} style={{ cursor: "pointer" }}>
                            Expiry <SortIcon field="expiry" />
                        </th>
                        <th onClick={() => toggleSort("status")} style={{ cursor: "pointer" }}>
                            Status <SortIcon field="status" />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedPolicies.map((policy) => (
                        <tr key={policy.id} className="tx-row">
                            <td className="tx-amount">{policy.id}</td>
                            <td className="tx-amount">${policy.premiumAmount.toFixed(2)}</td>
                            <td className="tx-amount">${policy.coverageAmount.toFixed(2)}</td>
                            <td>{new Date(policy.expiresAt).toLocaleDateString()}</td>
                            <td>
                                <StatusPill status={policy.status} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
