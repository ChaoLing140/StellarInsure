import type { Metadata } from "next";

import { PageSeo } from "@/components/page-seo";
import { buildMetadata } from "@/lib/seo";

import { ProtectedPage } from "@/components/protected-page";
import ClaimDetailPageClient from "./claim-detail-page-client";

const CLAIM_DETAILS: Record<string, { title: string; description: string }> = {
  "CLM-0091": {
    title: "Claim CLM-0091",
    description: "Review weather-trigger evidence, payout timeline, and transaction details for claim CLM-0091.",
  },
  "CLM-0042": {
    title: "Claim CLM-0042",
    description: "Track review progress, oracle evidence, and pending status for claim CLM-0042.",
  },
};

function getPageCopy(claimId: string) {
  return (
    CLAIM_DETAILS[claimId] ?? {
      title: `Claim ${claimId}`,
      description: "Review claim evidence, lifecycle events, and payout status for your StellarInsure submission.",
    }
  );
}

export function generateMetadata({ params }: { params: { claimId: string } }): Metadata {
  const copy = getPageCopy(params.claimId);

  return buildMetadata({
    title: copy.title,
    description: copy.description,
    pathname: `/claims/${params.claimId}`,
    keywords: ["claim detail", "claim evidence", "payout status", "review timeline"],
  });
}

export default function ClaimDetailPage({
  params,
}: {
  params: { claimId: string };
}) {
  const copy = getPageCopy(params.claimId);

  return (
    <>
      <PageSeo
        title={copy.title}
        description={copy.description}
        pathname={`/claims/${params.claimId}`}
      />
      <ProtectedPage>
        <ClaimDetailPageClient params={params} />
      </ProtectedPage>
    </>
  );
}
