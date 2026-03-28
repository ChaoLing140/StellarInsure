"use client";

import React from "react";

import { LegalPage } from "@/components/legal-page";

const SECTIONS = [
  {
    id: "overview",
    heading: "Overview",
    body: (
      <p>
        StellarInsure is a non-custodial, on-chain protocol. The vast majority of interactions occur
        directly between your wallet and the Stellar blockchain — no personal data is required to
        create or manage a policy. This Privacy Policy describes the limited data we collect through
        the web interface and how it is used.
      </p>
    ),
  },
  {
    id: "information-we-collect",
    heading: "Information We Collect",
    body: (
      <>
        <p>
          <strong>Blockchain data.</strong> Your Stellar wallet address and all on-chain
          transactions are publicly visible on the Stellar network. StellarInsure reads this data
          to display policy and claim information. We do not control the Stellar network and cannot
          delete or modify on-chain data.
        </p>
        <p>
          <strong>Email address (optional).</strong> If you choose to receive off-chain policy
          notifications you may provide an email address via your account settings. This is entirely
          optional and is not required to use the protocol.
        </p>
        <p>
          <strong>Usage data.</strong> Our backend logs may capture your wallet address alongside
          standard request metadata (timestamp, HTTP method, endpoint, response code) for security
          monitoring and debugging. Logs are retained for a maximum of 30 days.
        </p>
        <p>
          <strong>File uploads.</strong> If you attach evidence documents when submitting a claim,
          those files are stored in an access-controlled storage service and are accessible only to
          protocol administrators processing your claim.
        </p>
      </>
    ),
  },
  {
    id: "information-we-do-not-collect",
    heading: "Information We Do Not Collect",
    body: (
      <>
        <p>We do not collect or store:</p>
        <ul>
          <li>Wallet private keys or seed phrases.</li>
          <li>
            Government-issued identity documents (KYC is not required to use the base protocol).
          </li>
          <li>Precise geolocation data.</li>
          <li>Browser fingerprints or persistent tracking cookies.</li>
          <li>Payment card or bank account information.</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-your-information",
    heading: "How We Use Your Information",
    body: (
      <>
        <p>Data we collect is used solely to:</p>
        <ul>
          <li>Authenticate your wallet session and issue JWT access tokens.</li>
          <li>Display your policy list, claim history, and account information in the UI.</li>
          <li>Send optional email notifications about policy status changes.</li>
          <li>Detect and investigate security incidents or abuse of the API.</li>
          <li>Deliver webhooks to endpoints you configure in your account settings.</li>
        </ul>
        <p>We do not sell, rent, or share your data with third parties for marketing purposes.</p>
      </>
    ),
  },
  {
    id: "data-sharing",
    heading: "Data Sharing and Third Parties",
    body: (
      <>
        <p>
          <strong>Stellar network.</strong> On-chain activity is broadcast to all Stellar network
          nodes. This is inherent to blockchain technology and outside our control.
        </p>
        <p>
          <strong>Sentry (error monitoring).</strong> We use Sentry to capture and diagnose
          application errors in production. Error reports may include your wallet address if it was
          part of a failed request. Sentry data is governed by{" "}
          <a
            href="https://sentry.io/privacy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sentry&apos;s Privacy Policy
          </a>
          .
        </p>
        <p>
          <strong>Oracle providers.</strong> Trigger-condition data is sourced from third-party
          oracle feeds. The protocol transmits policy trigger parameters to oracles to evaluate
          claim conditions. No personally identifying information is shared with oracle providers.
        </p>
        <p>
          We do not share data with any other third party except when required by law or to protect
          the security of the protocol.
        </p>
      </>
    ),
  },
  {
    id: "data-retention",
    heading: "Data Retention",
    body: (
      <>
        <p>
          <strong>Request logs</strong> are deleted after 30 days.
        </p>
        <p>
          <strong>Policy and claim records</strong> stored in our off-chain database are retained
          for as long as your account is active and for up to 7 years afterward to meet potential
          regulatory record-keeping requirements.
        </p>
        <p>
          <strong>Claim evidence files</strong> are retained until the associated claim is fully
          settled, then deleted within 90 days.
        </p>
        <p>
          <strong>Email address</strong> is deleted promptly upon request or when you remove it
          from your account settings.
        </p>
      </>
    ),
  },
  {
    id: "security",
    heading: "Security",
    body: (
      <>
        <p>
          We apply industry-standard security measures including:
        </p>
        <ul>
          <li>JWT-based authentication with short-lived access tokens and refresh rotation.</li>
          <li>Rate limiting on all API endpoints.</li>
          <li>HMAC-signed webhook payloads.</li>
          <li>Encrypted storage for uploaded claim evidence.</li>
          <li>Regular dependency auditing via CI pipelines.</li>
        </ul>
        <p>
          No system is perfectly secure. If you discover a security vulnerability please report it
          responsibly via the project&apos;s GitHub security advisory process.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    heading: "Your Rights",
    body: (
      <>
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul>
          <li>Access a copy of the personal data we hold about you.</li>
          <li>Correct inaccurate personal data.</li>
          <li>Request deletion of personal data we hold off-chain (subject to legal retention obligations).</li>
          <li>Object to or restrict processing of your personal data.</li>
          <li>Withdraw consent for optional data processing (e.g., email notifications) at any time.</li>
        </ul>
        <p>
          On-chain data on the Stellar network cannot be deleted or modified by us or anyone else.
          This is a fundamental property of blockchain technology.
        </p>
        <p>
          To exercise any of the above rights, please open an issue in the{" "}
          <a
            href="https://github.com/ChaoLing140/StellarInsure/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            public repository
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    heading: "Cookies and Local Storage",
    body: (
      <>
        <p>
          The StellarInsure interface uses <strong>browser local storage</strong> to persist your
          language preference and wallet connection state between sessions. No third-party tracking
          cookies are set.
        </p>
        <p>
          Clearing your browser&apos;s local storage will log you out and reset your language
          preference. No personal data stored in local storage is transmitted to our servers.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    heading: "Changes to This Policy",
    body: (
      <p>
        We may update this Privacy Policy from time to time. Material changes will be communicated
        via the application&apos;s maintenance banner and the project&apos;s public repository.
        The last-updated date at the top of this page is revised with each update.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Contact",
    body: (
      <p>
        Questions about this Privacy Policy may be submitted via the{" "}
        <a
          href="https://github.com/ChaoLing140/StellarInsure/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub issue tracker
        </a>
        .
      </p>
    ),
  },
] as const;

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      lastUpdated="March 28, 2026"
      sections={SECTIONS}
      relatedLink={{ href: "/legal/terms", label: "Terms of Service" }}
    />
  );
}
