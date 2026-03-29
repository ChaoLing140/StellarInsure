"use client";

import React from "react";
import Link from "next/link";

import { LegalPage } from "@/components/legal-page";

const SECTIONS = [
  {
    id: "acceptance",
    heading: "Acceptance of Terms",
    body: (
      <>
        <p>
          By connecting your Stellar wallet and accessing any feature of StellarInsure you
          acknowledge that you have read, understood, and agree to be bound by these Terms of
          Service and our{" "}
          <Link href="/legal/privacy">Privacy Policy</Link>. If you do not agree, do not use the
          protocol.
        </p>
        <p>
          StellarInsure is non-custodial software. No entity holds your funds at any time;
          premiums and payouts are managed entirely by open-source smart contracts deployed on the
          Stellar network.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    heading: "Eligibility",
    body: (
      <>
        <p>
          You must be at least 18 years of age and not located in a jurisdiction where participation
          in decentralized finance protocols is prohibited by law. You are solely responsible for
          ensuring your use of StellarInsure complies with applicable local regulations.
        </p>
        <p>
          Persons on applicable sanctions lists are prohibited from using the protocol. By
          connecting a wallet you represent that you are not on any such list.
        </p>
      </>
    ),
  },
  {
    id: "protocol-description",
    heading: "Protocol Description",
    body: (
      <>
        <p>
          StellarInsure is a parametric insurance protocol. Coverage is triggered automatically
          when on-chain oracle data confirms a predefined event (the &ldquo;trigger condition&rdquo;)
          specified at policy creation. There is no manual claims adjudication.
        </p>
        <p>
          Premium amounts are calculated algorithmically based on policy type, coverage amount, and
          duration. The displayed premium is final at the time of policy creation and is collected
          via a Stellar token transfer authorized by your wallet.
        </p>
        <p>
          Payouts are denominated in the protocol token and transferred directly to the wallet
          address recorded on the policy.
        </p>
      </>
    ),
  },
  {
    id: "risks",
    heading: "Risk Disclosure",
    body: (
      <>
        <p>
          Use of StellarInsure involves significant risks including, but not limited to:
        </p>
        <ul>
          <li>
            <strong>Smart contract risk.</strong> Bugs or vulnerabilities in the protocol contracts
            could result in loss of funds. The contracts are open source and audited, but no audit
            guarantees the absence of all vulnerabilities.
          </li>
          <li>
            <strong>Oracle risk.</strong> Trigger conditions depend on third-party oracle data feeds.
            Inaccurate or delayed data may prevent a valid payout or cause an incorrect one.
          </li>
          <li>
            <strong>Liquidity risk.</strong> Payouts depend on sufficient liquidity in the risk pool.
            In extreme scenarios pool liquidity may be insufficient to cover all approved claims.
          </li>
          <li>
            <strong>Regulatory risk.</strong> The legal status of parametric insurance protocols is
            uncertain in many jurisdictions. Changes in regulation may affect your ability to use
            the protocol.
          </li>
          <li>
            <strong>Network risk.</strong> Stellar network congestion, outages, or protocol upgrades
            may delay transactions.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "user-responsibilities",
    heading: "User Responsibilities",
    body: (
      <>
        <p>You are responsible for:</p>
        <ul>
          <li>Maintaining the security of your wallet private keys and seed phrase.</li>
          <li>
            Verifying policy parameters — type, coverage amount, duration, and trigger condition —
            before authorizing the premium payment transaction.
          </li>
          <li>Ensuring your wallet holds sufficient funds to pay premiums.</li>
          <li>Keeping your contact information up to date if you opt to receive off-chain notifications.</li>
        </ul>
        <p>
          StellarInsure does not store private keys. Loss of access to your wallet is permanent and
          irrecoverable by the protocol.
        </p>
      </>
    ),
  },
  {
    id: "fees",
    heading: "Fees and Premiums",
    body: (
      <>
        <p>
          The premium displayed during policy creation is the total cost of coverage. No additional
          platform fees are charged at policy creation or claim payout.
        </p>
        <p>
          Stellar network transaction fees (lumens) are required for all on-chain operations and are
          not controlled by StellarInsure. These are shown in your wallet before you authorize any
          transaction.
        </p>
        <p>
          Premiums are non-refundable once the policy is active unless a cancellation function is
          explicitly provided in the smart contract and called before the policy coverage period
          begins.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    heading: "Intellectual Property",
    body: (
      <>
        <p>
          The StellarInsure front-end interface and documentation are released under the MIT License.
          The smart contract source code is open source and available in the public repository.
        </p>
        <p>
          The StellarInsure name and logo are trademarks of their respective owners and may not be
          used without prior written permission.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    heading: "Disclaimers and Limitation of Liability",
    body: (
      <>
        <p>
          THE PROTOCOL IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
          IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, THE CONTRIBUTORS, ADMINISTRATORS, AND
          LIQUIDITY PROVIDERS DISCLAIM ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A
          PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p>
          IN NO EVENT SHALL ANY CONTRIBUTOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE
          PROTOCOL, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    heading: "Governing Law",
    body: (
      <p>
        These terms shall be governed by and construed in accordance with applicable law. Any
        disputes arising in connection with these terms that cannot be resolved amicably shall be
        subject to binding arbitration. Nothing in this section limits your statutory rights as a
        consumer in your country of residence.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes to These Terms",
    body: (
      <>
        <p>
          StellarInsure may update these Terms of Service at any time. Material changes will be
          announced via the maintenance banner on the application and the public repository. Continued
          use of the protocol after changes take effect constitutes acceptance of the revised terms.
        </p>
        <p>
          The date at the top of this page reflects when these terms were last updated.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    heading: "Contact",
    body: (
      <p>
        Questions about these terms may be directed to the project through the{" "}
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

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      lastUpdated="March 28, 2026"
      sections={SECTIONS}
      relatedLink={{ href: "/legal/privacy", label: "Privacy Policy" }}
    />
  );
}
