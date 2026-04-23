"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { FeatureCard } from "@/components/feature-card";
import { Icon } from "@/components/icon";
import { TransactionModal } from "@/components/transaction-modal";
import { useAppTranslation } from "@/i18n/provider";

export default function HomePage() {
  const { locale, t } = useAppTranslation();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);

  useEffect(() => {
    headingRef.current?.focus();
  }, [locale]);

  return (
    <main id="main-content">
      <section className="hero" id="overview" aria-labelledby="hero-title">
        <div className="hero-grid">
          <article className="hero-card">
            <span className="eyebrow">{t("hero.badge")}</span>
            <h1 id="hero-title" ref={headingRef} tabIndex={-1}>
              {t("hero.title")}
            </h1>
            <p>{t("hero.description")}</p>

            <div className="cta-row">
              <a className="cta-primary" href="#coverage">
                {t("hero.primaryCta")}
              </a>
              <a className="cta-secondary" href="#workflow">
                {t("hero.secondaryCta")}
              </a>
              <button
                className="cta-secondary"
                type="button"
                onClick={() => setIsCreationModalOpen(true)}
              >
                Create sample policy
              </button>
              <Link className="cta-secondary" href="/policies/weather-alpha">
                View sample policy
              </Link>
            </div>
          </article>

          <aside className="metrics" aria-label={t("hero.metricsLabel")}>
            <div className="hero-card metric">
              <Icon name="clock" size="md" tone="accent" />
              <strong>3m</strong>
              <span>{t("metrics.processing")}</span>
            </div>
            <div className="hero-card metric">
              <Icon name="globe" size="md" tone="accent" />
              <strong>24/7</strong>
              <span>{t("metrics.availability")}</span>
            </div>
            <div className="hero-card metric">
              <Icon name="language" size="md" tone="accent" />
              <strong>2</strong>
              <span>{t("metrics.languages")}</span>
            </div>
          </aside>
        </div>
      </section>

      <section id="features" aria-labelledby="features-title">
        <div className="section-header">
          <span className="eyebrow">Protocol Features</span>
          <h2 id="features-title">Why StellarInsure</h2>
          <p>Built on Stellar for maximum reliability and minimum friction.</p>
        </div>

        <div className="feature-grid">
          <FeatureCard
            icon="wallet"
            title="Transparent Policy Creation"
            description="Clear actuarial rules combined with smart contract commitments."
            bullets={["On-chain terms", "Immutable coverage"]}
          />
          <FeatureCard
            icon="shield"
            title="Decentralized Oracle Verification"
            description="Trustless resolution powered by verifiable data feeds."
            bullets={["Secure data bridges", "Tamper-proof execution"]}
          />
          <FeatureCard
            icon="spark"
            title="Instant Automated Payouts"
            description="No claims adjusters. Payouts trigger automatically via smart contracts."
            bullets={["Zero wait time", "Direct to wallet"]}
          />
        </div>
      </section>

      <section id="coverage" aria-labelledby="coverage-title">
        <div className="section-header">
          <span className="eyebrow">{t("coverage.badge")}</span>
          <h2 id="coverage-title">{t("coverage.title")}</h2>
          <p>{t("coverage.description")}</p>
        </div>

        <div className="feature-grid">
          <FeatureCard
            icon="shield"
            title={t("coverage.cards.weather.title")}
            description={t("coverage.cards.weather.description")}
            bullets={[
              t("coverage.cards.weather.bullets.0"),
              t("coverage.cards.weather.bullets.1"),
            ]}
          />
          <FeatureCard
            icon="clock"
            title={t("coverage.cards.flight.title")}
            description={t("coverage.cards.flight.description")}
            bullets={[
              t("coverage.cards.flight.bullets.0"),
              t("coverage.cards.flight.bullets.1"),
            ]}
          />
          <FeatureCard
            icon="spark"
            title={t("coverage.cards.defi.title")}
            description={t("coverage.cards.defi.description")}
            bullets={[
              t("coverage.cards.defi.bullets.0"),
              t("coverage.cards.defi.bullets.1"),
            ]}
          />
        </div>
      </section>

      <section id="workflow" aria-labelledby="workflow-title">
        <div className="section-header">
          <span className="eyebrow">{t("workflow.badge")}</span>
          <h2 id="workflow-title">{t("workflow.title")}</h2>
          <p>{t("workflow.description")}</p>
        </div>

        <div className="workflow-grid">
          <article className="panel">
            <div className="panel-heading">
              <Icon name="wallet" size="md" tone="accent" />
              <h3>{t("workflow.userJourney.title")}</h3>
            </div>
            <ul>
              <li>{t("workflow.userJourney.steps.0")}</li>
              <li>{t("workflow.userJourney.steps.1")}</li>
              <li>{t("workflow.userJourney.steps.2")}</li>
            </ul>
          </article>
          <article className="panel">
            <div className="panel-heading">
              <Icon name="globe" size="md" tone="accent" />
              <h3>{t("workflow.accessibility.title")}</h3>
            </div>
            <ul>
              <li>{t("workflow.accessibility.steps.0")}</li>
              <li>{t("workflow.accessibility.steps.1")}</li>
              <li>{t("workflow.accessibility.steps.2")}</li>
            </ul>
          </article>
        </div>
      </section>

      <TransactionModal
        isOpen={isCreationModalOpen}
        onClose={() => setIsCreationModalOpen(false)}
        type="creation"
        policyType="Weather protection"
        amount={12000}
        destination="GCFX...J4F7"
        onConfirm={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }}
      />
    </main>
  );
}
