"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LanguageSwitcher } from "@/components/language-switcher";
import { NetworkSwitcher } from "@/components/network-switcher";
import { WalletConnectionButton } from "@/components/wallet-connection-button";
import { CommandPalette } from "@/components/command-palette";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview" },
  { href: "/create", label: "Create Policy" },
  { href: "/policies", label: "My Policies" },
  { href: "/history", label: "History" },
  { href: "/treasury", label: "Treasury" },
  { href: "/settings", label: "Preferences" },
];

const PAGE_CONTEXT: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Overview",
    description: "Monitor coverage, payouts, and protocol activity from one place.",
  },
  "/create": {
    title: "Create Policy",
    description: "Build policy terms, review pricing, and submit coverage on Stellar.",
  },
  "/policies": {
    title: "Policy Portfolio",
    description: "Review active and historical policies with real-time status updates.",
  },
  "/history": {
    title: "Transaction History",
    description: "Inspect premium, payout, and refund events with explorer deep links.",
  },
  "/treasury": {
    title: "Treasury",
    description: "Manage your risk pool deposits and initiate cooldown-based withdrawals.",
  },
};

function getPageContext(pathname: string) {
  if (pathname.startsWith("/policies/")) {
    return {
      title: "Policy Details",
      description: "Inspect policy status, claim history, and payout readiness.",
    };
  }

  if (pathname.startsWith("/legal/")) {
    return {
      title: "Legal",
      description: "Review protocol terms, responsibilities, and privacy commitments.",
    };
  }

  return PAGE_CONTEXT[pathname] ?? PAGE_CONTEXT["/"];
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const context = useMemo(() => getPageContext(pathname), [pathname]);

  function closeDrawer() {
    setDrawerOpen(false);
  }

  return (
    <>
      <header className="topbar" aria-label="Primary">
        <Link className="brand" href="/" onClick={closeDrawer}>
          <span className="brand-mark" aria-hidden="true">
            SI
          </span>
          <span className="brand-copy">
            <strong>StellarInsure</strong>
            <span>Parametric cover on Stellar</span>
          </span>
        </Link>

        <button
          type="button"
          className="mobile-nav-toggle"
          aria-expanded={drawerOpen}
          aria-controls="mobile-nav-drawer"
          onClick={() => setDrawerOpen((open) => !open)}
        >
          {drawerOpen ? "Close menu" : "Open menu"}
        </button>

        <nav className="nav-links nav-links--desktop" aria-label="Section navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="topbar-actions topbar-actions--desktop">
          <CommandPalette />
          <NetworkSwitcher />
          <WalletConnectionButton />
          <LanguageSwitcher />
        </div>
      </header>

      <div className={`mobile-drawer-backdrop ${drawerOpen ? "is-open" : ""}`} onClick={closeDrawer} />
      <aside
        id="mobile-nav-drawer"
        className={`mobile-drawer ${drawerOpen ? "is-open" : ""}`}
        aria-hidden={!drawerOpen}
      >
        <nav className="mobile-drawer__links" aria-label="Mobile section navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={closeDrawer}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mobile-drawer__actions">
          <CommandPalette />
          <NetworkSwitcher />
          <WalletConnectionButton />
          <LanguageSwitcher />
        </div>
      </aside>

      <section className="page-context motion-panel" aria-label="Current page context">
        <h2>{context.title}</h2>
        <p>{context.description}</p>
      </section>
    </>
  );
}
