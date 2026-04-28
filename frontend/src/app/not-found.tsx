import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="error-page" aria-labelledby="error-heading">
      <div className="error-page__card motion-panel">
        <span className="eyebrow" aria-hidden="true">404</span>

        <h1 id="error-heading" className="error-page__heading">
          Page not found
        </h1>

        <p className="error-page__message">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Check the URL or navigate back to a known page.
        </p>

        <nav className="error-page__actions cta-row" aria-label="Recovery options">
          <Link href="/" className="cta-primary">
            Go to home
          </Link>
          <Link href="/policies" className="cta-secondary">
            View policies
          </Link>
        </nav>

        <p className="error-page__support">
          Need help?{" "}
          <a
            href="mailto:support@stellarinsure.io"
            className="error-page__support-link"
          >
            Contact support
          </a>
        </p>
      </div>
    </main>
  );
}
