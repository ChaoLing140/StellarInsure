import type { Metadata } from "next";

import { PageSeo } from "@/components/page-seo";
import { buildMetadata } from "@/lib/seo";

import { ProtectedPage } from "@/components/protected-page";
import TreasuryPageClient from "./treasury-page-client";

const PAGE_TITLE = "Treasury";
const PAGE_DESCRIPTION = "Manage your risk pool deposits and withdrawals.";

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  pathname: "/treasury",
  keywords: ["treasury", "risk pool", "deposits", "withdrawals"],
});

export default function TreasuryPage() {
  return (
    <>
      <PageSeo title={PAGE_TITLE} description={PAGE_DESCRIPTION} pathname="/treasury" />
      <ProtectedPage>
        <TreasuryPageClient />
      </ProtectedPage>
    </>
  );
}
