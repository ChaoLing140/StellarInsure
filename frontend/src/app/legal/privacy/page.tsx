import type { Metadata } from "next";

import { PageSeo } from "@/components/page-seo";
import { buildMetadata } from "@/lib/seo";

import PrivacyPageClient from "./privacy-page-client";

const PAGE_TITLE = "Privacy Policy";
const PAGE_DESCRIPTION = "Understand what data StellarInsure collects, how blockchain data is used, and your privacy rights.";

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  pathname: "/legal/privacy",
  keywords: ["privacy policy", "wallet data", "blockchain privacy", "data retention"],
});

export default function PrivacyPage() {
  return (
    <>
      <PageSeo title={PAGE_TITLE} description={PAGE_DESCRIPTION} pathname="/legal/privacy" />
      <PrivacyPageClient />
    </>
  );
}
