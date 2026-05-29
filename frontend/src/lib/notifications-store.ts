/**
 * Shared notifications state (#302).
 *
 * Both `site-header.tsx` (the bell trigger) and `notifications-panel.tsx`
 * need to read the same list so the bell's unread indicator stays in
 * sync with the panel's contents. This module centralises the seed data
 * + the in-memory subscription so re-render fan-out is a single hook
 * call away. When a real notifications API arrives, swap the
 * `MOCK_NOTIFICATIONS` array out for a fetched value — the public hook
 * surface stays the same.
 */
import { useEffect, useState } from 'react';

export interface Notification {
  id: string;
  type: 'policy' | 'claim' | 'transaction' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'policy',
    title: 'Policy Updated',
    message: 'Your weather protection policy has been activated.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '2',
    type: 'claim',
    title: 'Claim Approved',
    message: 'Your claim POL-2024-00124 has been approved for payment.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '3',
    type: 'transaction',
    title: 'Premium Paid',
    message: 'Your premium payment of 1000 XLM has been confirmed.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
  },
];

type Listener = (notifications: Notification[]) => void;

let currentNotifications: Notification[] = MOCK_NOTIFICATIONS;
const listeners = new Set<Listener>();

function publish(): void {
  for (const fn of listeners) fn(currentNotifications);
}

/**
 * Replace the entire notifications list. Used by `NotificationsPanel`
 * when the user marks items as read / clears all / refreshes.
 */
export function setNotifications(next: Notification[]): void {
  currentNotifications = next;
  publish();
}

export function getNotifications(): Notification[] {
  return currentNotifications;
}

export function getUnreadCount(): number {
  return currentNotifications.filter((n) => !n.read).length;
}

/**
 * React hook returning the current notifications + unread count. Re-renders
 * the caller whenever `setNotifications` fires.
 */
export function useNotifications(): {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (next: Notification[]) => void;
} {
  const [snapshot, setSnapshot] = useState<Notification[]>(currentNotifications);

  useEffect(() => {
    const handler: Listener = (next) => setSnapshot(next);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return {
    notifications: snapshot,
    unreadCount: snapshot.filter((n) => !n.read).length,
    setNotifications,
  };
}
