"use client";

import React, { type ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface LegalSection {
  /** URL-safe fragment identifier — used as `id` on the heading element. */
  id: string;
  /** Section heading text rendered as an `<h2>`. */
  heading: string;
  /** Section body content (may include JSX). */
  body: ReactNode;
}

export interface LegalPageProps {
  /** Small badge text displayed above the title (e.g. "Legal"). */
  eyebrow: string;
  /** Page `<h1>` text. */
  title: string;
  /** Human-readable last-updated date string. */
  lastUpdated: string;
  /** Ordered list of sections rendered in the document body. */
  sections: readonly LegalSection[];
  /** Optional cross-link to the sibling legal page (terms ↔ privacy). */
  relatedLink?: { href: string; label: string };
}

/**
 * Reusable shell for legal pages (Terms of Service, Privacy Policy).
 *
 * Renders a sticky table of contents sidebar on wider viewports and collapses
 * it to an inline list above the content on mobile. Each section heading
 * receives an `id` anchor so direct URL fragments work out of the box.
 *
 * Accessibility:
 * - Skip-link on the page already covers the main-content landmark.
 * - ToC `<nav>` has an aria-label to distinguish it from the primary nav.
 * - Active ToC item is tracked with `aria-current="true"`.
 * - Smooth-scroll is CSS-driven so it respects `prefers-reduced-motion`.
 */
export function LegalPage({
  eyebrow,
  title,
  lastUpdated,
  sections,
  relatedLink,
}: LegalPageProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Track which section heading is currently visible to highlight ToC item.
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Pick the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 },
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [sections]);

  return (
    <main id="main-content" className="legal-page">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <header className="legal-header">
        <div className="section-header">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p className="legal-meta">
            Last updated: <time>{lastUpdated}</time>
          </p>
        </div>

        {relatedLink && (
          <div className="legal-header__actions">
            <Link className="cta-secondary" href={relatedLink.href}>
              {relatedLink.label}
            </Link>
            <Link className="cta-secondary" href="/">
              Back to home
            </Link>
          </div>
        )}
      </header>

      <div className="legal-layout">
        {/* ── Table of Contents ────────────────────────────────────────────── */}
        <nav
          className="legal-toc"
          aria-label="Table of contents"
        >
          <p className="metadata-label">On this page</p>
          <ol className="legal-toc__list">
            {sections.map(({ id, heading }) => (
              <li key={id}>
                <a
                  className={`legal-toc__link${activeId === id ? " legal-toc__link--active" : ""}`}
                  href={`#${id}`}
                  aria-current={activeId === id ? "true" : undefined}
                >
                  {heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Document body ────────────────────────────────────────────────── */}
        <article className="legal-body">
          {sections.map(({ id, heading, body }) => (
            <section key={id} className="legal-section" aria-labelledby={`${id}-heading`}>
              <h2 id={id} className="legal-section__heading">
                <a className="legal-anchor" href={`#${id}`} aria-label={`Anchor for ${heading}`}>
                  #
                </a>
                <span id={`${id}-heading`}>{heading}</span>
              </h2>
              <div className="legal-section__body">{body}</div>
            </section>
          ))}

          {/* ── Footer nav ─────────────────────────────────────────────────── */}
          <div className="legal-footer-nav">
            {relatedLink && (
              <Link className="cta-secondary" href={relatedLink.href}>
                {relatedLink.label}
              </Link>
            )}
            <Link className="cta-secondary" href="/">
              Back to home
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
