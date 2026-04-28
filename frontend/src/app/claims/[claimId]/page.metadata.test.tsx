import { describe, expect, it } from "vitest";

import { absoluteUrl } from "@/lib/seo";

import { generateMetadata } from "./page";

describe("ClaimDetailPage metadata", () => {
  it("generates route-specific metadata for known claims", () => {
    const metadata = generateMetadata({ params: { claimId: "CLM-0091" } });

    expect(metadata.title).toBe("Claim CLM-0091");
    expect(metadata.description).toMatch(/payout timeline/i);
    expect(metadata.alternates?.canonical).toBe(absoluteUrl("/claims/CLM-0091"));
    expect(metadata.openGraph?.url).toBe(absoluteUrl("/claims/CLM-0091"));
    expect(metadata.openGraph?.images?.[0]?.url).toBe("/opengraph-image");
  });

  it("falls back to generic metadata for unknown claims", () => {
    const metadata = generateMetadata({ params: { claimId: "CLM-7777" } });

    expect(metadata.title).toBe("Claim CLM-7777");
    expect(metadata.description).toMatch(/review claim evidence/i);
    expect(metadata.alternates?.canonical).toBe(absoluteUrl("/claims/CLM-7777"));
  });
});
