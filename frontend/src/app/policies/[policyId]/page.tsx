import type { Metadata } from "next";

import { StructuredData } from "@/components/structured-data";
import { buildMetadata, webPageStructuredData } from "@/lib/seo";

import PolicyDetailPageClient from "./policy-detail-page-client";

const POLICY_DETAILS: Record<string, { title: string; description: string }> = {
  "weather-alpha": {
    title: "Northern Plains Weather Guard",
    description: "Policy detail for rainfall-triggered weather protection, claim status, and printable support handoff packet.",
  },
  "flight-orbit": {
    title: "Flight Orbit Delay Cover",
    description: "Policy detail for flight delay coverage with trigger windows, payout destination, and claim activity status.",
  },
};

function getPageCopy(policyId: string) {
  return (
    POLICY_DETAILS[policyId] ?? {
      title: "Policy Detail",
      description: "Review policy coverage, trigger conditions, and claim activity for StellarInsure policy snapshots.",
    }
  );
}

export function generateMetadata({ params }: { params: { policyId: string } }): Metadata {
  const copy = getPageCopy(params.policyId);

  return buildMetadata({
    title: copy.title,
    description: copy.description,
    pathname: `/policies/${params.policyId}`,
    keywords: ["policy detail", "parametric trigger", "claim activity", "printable receipt"],
  });
}

export default function PolicyDetailPage({ params }: { params: { policyId: string } }) {
  const copy = getPageCopy(params.policyId);

  return (
    <>
      <StructuredData
        data={webPageStructuredData({
          title: `${copy.title} | StellarInsure`,
          description: copy.description,
          pathname: `/policies/${params.policyId}`,
        })}
      />
      <PolicyDetailPageClient params={params} />
    </>
  );
}
