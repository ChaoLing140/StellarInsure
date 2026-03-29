import type { Metadata } from "next";

import { StructuredData } from "@/components/structured-data";
import { buildMetadata, webPageStructuredData } from "@/lib/seo";

import CreatePolicyPageClient from "./create-page-client";

const PAGE_TITLE = "Create Policy";
const PAGE_DESCRIPTION = "Configure coverage, pick oracle providers, and submit Stellar-based parametric insurance policies with guided steps.";

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  pathname: "/create",
  keywords: ["create policy", "oracle selector", "Stellar wallet", "insurance receipt"],
});

export default function CreatePolicyPage() {
  return (
    <>
      <StructuredData
        data={webPageStructuredData({
          title: `${PAGE_TITLE} | StellarInsure`,
          description: PAGE_DESCRIPTION,
          pathname: "/create",
        })}
      />
      <CreatePolicyPageClient />
    </>
  );
}
