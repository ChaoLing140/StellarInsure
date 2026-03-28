import type { Metadata } from "next";
import Link from "next/link";

import { LanguageProvider } from "@/i18n/provider";
import { MaintenanceBanner } from "@/components/maintenance-banner";
import { LanguageSwitcher } from "@/components/language-switcher";
import { OnboardingFlow } from "@/components/onboarding";
import { PageTransition } from "@/components/page-transition";

import "./globals.css";

export const metadata: Metadata = {
  title: "StellarInsure",
  description: "Accessible parametric insurance on Stellar with multilingual support.",
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

              <LanguageSwitcher />
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
        </LanguageProvider>
      </body>
    </html>
  );
}
