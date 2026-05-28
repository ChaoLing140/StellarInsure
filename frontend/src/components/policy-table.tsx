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
            let valA: string | number = "";
            let valB: string | number = "";

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

    const fieldNames: Record<SortField, string> = {
        id: "Policy ID",
        premium: "Premium",
        coverage: "Coverage",
        expiry: "Expiry",
        status: "Status",
    };

    const getSortButtonAriaLabel = (field: SortField): string => {
        const name = fieldNames[field];
        if (sortField !== field) return `Sort by ${name}`;
        return sortOrder === "asc"
            ? `${name}, sorted ascending. Click to sort descending`
            : `${name}, sorted descending. Click to sort ascending`;
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        const iconLabel = fieldNames[field];
        if (sortField !== field) return <Icon name="chevron-up-down" size="sm" tone="muted" label={iconLabel} />;
        return sortOrder === "asc" ? (
            <Icon name="chevron-up" size="sm" tone="accent" label={iconLabel} />
        ) : (
            <Icon name="chevron-down" size="sm" tone="accent" label={iconLabel} />
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
                <caption className="sr-only">Policy list with sortable columns</caption>
                <thead>
                    <tr>
                        <th>
                            <button
                                onClick={() => toggleSort("id")}
                                className="sort-button"
                                aria-label={getSortButtonAriaLabel("id")}
                            >
                                Policy ID <SortIcon field="id" />
                            </button>
                        </th>
                        <th>
                            <button
                                onClick={() => toggleSort("premium")}
                                className="sort-button"
                                aria-label={getSortButtonAriaLabel("premium")}
                            >
                                Premium <SortIcon field="premium" />
                            </button>
                        </th>
                        <th>
                            <button
                                onClick={() => toggleSort("coverage")}
                                className="sort-button"
                                aria-label={getSortButtonAriaLabel("coverage")}
                            >
                                Coverage <SortIcon field="coverage" />
                            </button>
                        </th>
                        <th>
                            <button
                                onClick={() => toggleSort("expiry")}
                                className="sort-button"
                                aria-label={getSortButtonAriaLabel("expiry")}
                            >
                                Expiry <SortIcon field="expiry" />
                            </button>
                        </th>
                        <th>
                            <button
                                onClick={() => toggleSort("status")}
                                className="sort-button"
                                aria-label={getSortButtonAriaLabel("status")}
                            >
                                Status <SortIcon field="status" />
                            </button>
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
