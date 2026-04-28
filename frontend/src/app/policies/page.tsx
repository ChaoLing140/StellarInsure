import type { Metadata } from "next";

import { PageSeo } from "@/components/page-seo";
import { buildMetadata } from "@/lib/seo";

import { ProtectedPage } from "@/components/protected-page";
import PoliciesListPageClient from "./policies-list-page-client";

const PAGE_TITLE = "My Policies";
const PAGE_DESCRIPTION = "View all your active and past parametric insurance policies with coverage details, premium amounts, and claim status on Stellar.";

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  pathname: "/policies",
  keywords: ["my policies", "policy list", "coverage", "claims", "parametric insurance"],
});

export default function PoliciesListPage() {
  return (
    <>
      <PageSeo title={PAGE_TITLE} description={PAGE_DESCRIPTION} pathname="/policies" />
      <ProtectedPage>
        <PoliciesListPageClient />
      </ProtectedPage>
    </>
  );
}
