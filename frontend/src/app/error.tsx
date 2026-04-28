"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { logError } from "@/lib/error-logger";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    logError(error, { tags: { source: "next-error-boundary" } });
  }, [error]);

  return (
    <main id="main-content" tabIndex={-1} className="error-page" aria-labelledby="error-heading">
      <div className="error-page__card motion-panel">
        <span className="eyebrow" aria-hidden="true">500</span>

        <h1 id="error-heading" className="error-page__heading">
          Something went wrong
        </h1>

        <p className="error-page__message">
          We encountered an unexpected error. Our team has been notified.
          You can try again or return to the home page.
        </p>

        {process.env.NODE_ENV !== "production" && error.message && (
          <details className="error-page__details">
            <summary>Error details</summary>
            <pre className="error-page__pre">{error.message}</pre>
            {error.digest && (
              <p className="error-page__digest">Digest: {error.digest}</p>
            )}
          </details>
        )}

        <nav className="error-page__actions cta-row" aria-label="Recovery options">
          <button type="button" className="cta-primary" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="cta-secondary">
            Go to home
          </Link>
        </nav>

        <p className="error-page__support">
          Still having issues?{" "}
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
