import type { Metadata } from "next";

import { PageSeo } from "@/components/page-seo";
import { buildMetadata } from "@/lib/seo";

import TermsPageClient from "./terms-page-client";

const PAGE_TITLE = "Terms of Service";
const PAGE_DESCRIPTION = "Read StellarInsure terms covering eligibility, oracle risks, user responsibilities, and legal disclaimers.";

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  pathname: "/legal/terms",
  keywords: ["terms of service", "oracle risk", "decentralized insurance legal terms"],
});

export default function TermsPage() {
  return (
    <>
      <PageSeo title={PAGE_TITLE} description={PAGE_DESCRIPTION} pathname="/legal/terms" />
      <TermsPageClient />
    </>
  );
}
