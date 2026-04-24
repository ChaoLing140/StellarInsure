import React from "react";
import TreasuryPageClient from "./treasury-page-client";

export const metadata = {
    title: "Treasury | StellarInsure",
    description: "Manage your risk pool deposits and withdrawals.",
};

export default function TreasuryPage() {
    return <TreasuryPageClient />;
}
