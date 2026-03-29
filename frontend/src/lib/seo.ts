import type { Metadata } from "next";

const FALLBACK_SITE_URL = "https://stellarinsure.app";
const DEFAULT_OG_IMAGE = "/opengraph-image";

export const SITE_NAME = "StellarInsure";

function sanitizeSiteUrl(raw: string | undefined): string {
  if (!raw) {
    return FALLBACK_SITE_URL;
  }

  try {
    const normalized = raw.startsWith("http") ? raw : `https://${raw}`;
    const url = new URL(normalized);
    return url.toString().replace(/\/$/, "");
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const SITE_URL = sanitizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export function absoluteUrl(pathname: string = "/"): string {
  return new URL(pathname, `${SITE_URL}/`).toString();
}

interface BuildMetadataOptions {
  title: string;
  description: string;
  pathname: string;
  keywords?: string[];
  type?: "website" | "article";
}

export function buildMetadata({
  title,
  description,
  pathname,
  keywords = [],
  type = "website",
}: BuildMetadataOptions): Metadata {
  const canonical = absoluteUrl(pathname);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_US",
      type,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${title} | ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export function organizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/opengraph-image"),
    sameAs: ["https://github.com/ChaoLing140/StellarInsure"],
  };
}

export function websiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/history?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function webPageStructuredData({
  title,
  description,
  pathname,
}: {
  title: string;
  description: string;
  pathname: string;
}) {
  const pageUrl = absoluteUrl(pathname);

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    inLanguage: "en-US",
  };
}
