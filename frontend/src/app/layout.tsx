import type { Metadata } from "next";
import Link from "next/link";

import { StructuredData } from "@/components/structured-data";
import { WalletConnectionButton } from "@/components/wallet-connection-button";
import { WalletProvider } from "@/components/wallet-provider";
import { MaintenanceBanner } from "@/components/maintenance-banner";
import { LanguageSwitcher } from "@/components/language-switcher";
import { OnboardingFlow } from "@/components/onboarding";
import { PageTransition } from "@/components/page-transition";
import { LanguageProvider } from "@/i18n/provider";
import {
  SITE_URL,
  absoluteUrl,
  organizationStructuredData,
  websiteStructuredData,
} from "@/lib/seo";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "StellarInsure",
    template: "%s | StellarInsure",
  },
  description: "Accessible parametric insurance on Stellar with multilingual support.",
  applicationName: "StellarInsure",
  alternates: {
    canonical: absoluteUrl("/"),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "StellarInsure",
    description: "Accessible parametric insurance on Stellar with multilingual support.",
    url: absoluteUrl("/"),
    siteName: "StellarInsure",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "StellarInsure open graph preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StellarInsure",
    description: "Accessible parametric insurance on Stellar with multilingual support.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <WalletProvider>
            <StructuredData data={organizationStructuredData()} />
            <StructuredData data={websiteStructuredData()} />
            <OnboardingFlow />
            <a className="skip-link" href="#main-content">
              Skip to main content
            </a>
            <div className="page-shell">
              <MaintenanceBanner />

              <header className="topbar" aria-label="Primary">
                <Link className="brand" href="/">
                  <span className="brand-mark" aria-hidden="true">
                    SI
                  </span>
                  <span className="brand-copy">
                    <strong>StellarInsure</strong>
                    <span>Parametric cover on Stellar</span>
                  </span>
                </Link>

                <nav className="nav-links" aria-label="Section navigation">
                  <Link href="/">Overview</Link>
                  <Link href="/create">Create Policy</Link>
                  <Link href="/policies/weather-alpha">Policy Detail</Link>
                  <Link href="/history">History</Link>
                </nav>

                <div className="topbar-actions">
                  <WalletConnectionButton />
                  <LanguageSwitcher />
                </div>
              </header>

              <PageTransition>{children}</PageTransition>

              <footer className="footer">
                <span>Built for transparent policy creation, automated claims, and multilingual access.</span>
                <nav aria-label="Legal">
                  <Link href="/legal/terms">Terms of Service</Link>
                  <Link href="/legal/privacy">Privacy Policy</Link>
                </nav>
              </footer>
            </div>
          </WalletProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
