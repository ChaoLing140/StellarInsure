'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LanguageSwitcher } from '@/components/language-switcher';
import { NetworkSwitcher } from '@/components/network-switcher';
import { NetworkBadge } from '@/components/network-badge';
import { WalletConnectionButton } from '@/components/wallet-connection-button';
import { CommandPalette } from '@/components/command-palette';
import { KeyboardShortcutsHelp } from '@/components/keyboard-shortcuts-help';
import { NotificationsPanel } from '@/components/notifications-panel';
import { useNotifications } from '@/lib/notifications-store';
import { Icon } from '@/components/icon';
import { ThemeToggle } from '@/components/theme-toggle';

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Overview' },
  { href: '/create', label: 'Create Policy' },
  { href: '/policies', label: 'My Policies' },
  { href: '/history', label: 'History' },
  { href: '/treasury', label: 'Treasury' },
  { href: '/settings', label: 'Preferences' },
];

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const PAGE_CONTEXT: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Overview',
    description:
      'Monitor coverage, payouts, and protocol activity from one place.',
  },
  '/create': {
    title: 'Create Policy',
    description:
      'Build policy terms, review pricing, and submit coverage on Stellar.',
  },
  '/policies': {
    title: 'Policy Portfolio',
    description:
      'Review active and historical policies with real-time status updates.',
  },
  '/history': {
    title: 'Transaction History',
    description:
      'Inspect premium, payout, and refund events with explorer deep links.',
  },
  '/treasury': {
    title: 'Treasury',
    description:
      'Manage your risk pool deposits and initiate cooldown-based withdrawals.',
  },
};

function getPageContext(pathname: string) {
  if (pathname.startsWith('/policies/')) {
    return {
      title: 'Policy Details',
      description:
        'Inspect policy status, claim history, and payout readiness.',
    };
  }

  if (pathname.startsWith('/legal/')) {
    return {
      title: 'Legal',
      description:
        'Review protocol terms, responsibilities, and privacy commitments.',
    };
  }

  return PAGE_CONTEXT[pathname] ?? PAGE_CONTEXT['/'];
}

export function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const context = useMemo(() => getPageContext(pathname), [pathname]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const notificationsTriggerRef = useRef<HTMLButtonElement>(null);
  // #302 — Subscribed to the shared notifications store so the bell's
  // unread indicator stays in sync with the panel without prop drilling.
  const { unreadCount } = useNotifications();

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;

    const focusableElements = Array.from(
      drawerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []
    ).filter((element) => !element.hasAttribute('disabled'));

    const firstFocusable = focusableElements[0] ?? drawerRef.current;
    firstFocusable?.focus();
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;

    function handleDocumentKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDrawer();
      }
    }

    document.addEventListener('keydown', handleDocumentKeyDown);
    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, [closeDrawer, drawerOpen]);

  const handleDrawerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeDrawer();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ??
          []
      ).filter((element) => !element.hasAttribute('disabled'));

      if (focusableElements.length === 0) {
        event.preventDefault();
        drawerRef.current?.focus();
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    },
    [closeDrawer]
  );

  function toggleDrawer() {
    if (drawerOpen) {
      closeDrawer();
    } else {
      setDrawerOpen(true);
    }
  }

  return (
    <>
      <header className="topbar" aria-label="Primary">
        <Link
          className="brand"
          href="/"
          onClick={() => {
            if (drawerOpen) closeDrawer();
          }}
        >
          <span className="brand-mark" aria-hidden="true">
            SI
          </span>
          <span className="brand-copy">
            <strong>StellarInsure</strong>
            <span>Parametric cover on Stellar</span>
          </span>
        </Link>

        <button
          ref={triggerRef}
          type="button"
          className="mobile-nav-toggle"
          aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={drawerOpen}
          aria-controls="mobile-nav-drawer"
          onClick={toggleDrawer}
        >
          <Icon name={drawerOpen ? 'close' : 'menu'} size="md" tone="muted" />
        </button>

        <nav
          className="nav-links nav-links--desktop"
          aria-label="Section navigation"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="topbar-actions topbar-actions--desktop">
          <button
            ref={notificationsTriggerRef}
            className="topbar-action-btn topbar-action-btn--with-badge"
            onClick={() => setNotificationsOpen(true)}
            aria-label={
              unreadCount > 0
                ? `Open notifications, ${unreadCount} unread`
                : 'Open notifications'
            }
            title="Notifications"
          >
            <Icon name="bell" size="md" tone="muted" />
            {unreadCount > 0 && (
              <span
                className="topbar-action-badge"
                aria-hidden="true"
                data-testid="notifications-unread-badge"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <CommandPalette />
          <KeyboardShortcutsHelp />
          <ThemeToggle />
          <NetworkSwitcher />
          <WalletConnectionButton />
          <LanguageSwitcher />
        </div>
      </header>

      <div
        className={`mobile-drawer-backdrop ${drawerOpen ? 'is-open' : ''}`}
        onClick={closeDrawer}
      />
      <aside
        ref={drawerRef}
        id="mobile-nav-drawer"
        className={`mobile-drawer ${drawerOpen ? 'is-open' : ''}`}
        aria-hidden={!drawerOpen}
        onKeyDown={handleDrawerKeyDown}
        tabIndex={-1}
      >
        <nav
          className="mobile-drawer__links"
          aria-label="Mobile section navigation"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? 'page' : undefined}
              onClick={closeDrawer}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mobile-drawer__actions">
          <CommandPalette />
          <KeyboardShortcutsHelp />
          <ThemeToggle />
          <NetworkSwitcher />
          <WalletConnectionButton />
          <LanguageSwitcher />
        </div>
      </aside>

      <section
        className="page-context motion-panel"
        aria-label="Current page context"
      >
        <h2>{context.title}</h2>
        <p>{context.description}</p>
      </section>

      <NotificationsPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        returnFocusRef={notificationsTriggerRef}
      />
    </>
  );
}
