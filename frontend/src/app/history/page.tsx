import type { Metadata } from "next";

import { PageSeo } from "@/components/page-seo";
import { buildMetadata } from "@/lib/seo";

import { ProtectedPage } from "@/components/protected-page";
import TransactionHistoryPageClient from "./history-page-client";

const PAGE_TITLE = "Transaction History";
const PAGE_DESCRIPTION = "Review premium payments, claim payouts, and refunds with filters and direct Stellar Explorer links.";

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  pathname: "/history",
  keywords: ["transaction history", "Stellar Explorer", "premium payments", "claim payouts"],
});

export default function TransactionHistoryPage() {
  return (
    <>
      <PageSeo title={PAGE_TITLE} description={PAGE_DESCRIPTION} pathname="/history" />
      <ProtectedPage>
        <TransactionHistoryPageClient />
      </ProtectedPage>
    </>
  );
}
