import type { Metadata } from "next";
import Link from "next/link";

import { LanguageProvider } from "@/i18n/provider";
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
                <Link href="/policies/weather-alpha">Policy Detail</Link>
                <Link href="/history">History</Link>
                <a href="#coverage">Coverage</a>
                <a href="#workflow">Workflow</a>
              </nav>

              <LanguageSwitcher />
            </header>

            <PageTransition>{children}</PageTransition>

            <footer className="footer">
              Built for transparent policy creation, automated claims, and multilingual access.
            </footer>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
