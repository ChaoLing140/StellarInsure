import type { Metadata } from "next";

import { PageSeo } from "@/components/page-seo";
import { buildMetadata } from "@/lib/seo";

import { ProtectedPage } from "@/components/protected-page";
import SettingsPageClient from "./settings-page-client";

const PAGE_TITLE = "Account Preferences";
const PAGE_DESCRIPTION = "Manage timezone, currency display, and communication preferences.";

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  pathname: "/settings",
  keywords: ["settings", "account preferences", "timezone", "currency"],
});

export default function SettingsPage() {
  return (
    <>
      <PageSeo title={PAGE_TITLE} description={PAGE_DESCRIPTION} pathname="/settings" />
      <ProtectedPage>
        <SettingsPageClient />
      </ProtectedPage>
    </>
  );
}
