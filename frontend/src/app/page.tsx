import type { Metadata } from "next";

import { PageSeo } from "@/components/page-seo";
import { buildMetadata } from "@/lib/seo";

import HomePageClient from "./home-page-client";

const PAGE_TITLE = "Overview";
const PAGE_DESCRIPTION = "Explore multilingual, automated parametric insurance coverage on Stellar with transparent policy and claim workflows.";

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  pathname: "/",
  keywords: ["Stellar", "parametric insurance", "DeFi insurance", "wallet-based claims"],
});

export default function HomePage() {
  return (
    <>
      <PageSeo title={PAGE_TITLE} description={PAGE_DESCRIPTION} pathname="/" />
      <HomePageClient />
    </>
  );
}
