"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/icon";

export interface Notification {
  id: string;
  type: "policy" | "claim" | "transaction";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "policy",
    title: "Policy Updated",
    message: "Your weather protection policy has been activated.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: "2",
    type: "claim",
    title: "Claim Approved",
    message: "Your claim POL-2024-00124 has been approved for payment.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: "3",
    type: "transaction",
    title: "Premium Paid",
    message: "Your premium payment of 1000 XLM has been confirmed.",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
  },
];

function getNotificationIcon(type: Notification["type"]): string {
  const iconMap: Record<Notification["type"], string> = {
    policy: "shield",
    claim: "document",
    transaction: "wallet",
  };
  return iconMap[type];
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function loadNotifications() {
      setLoading(true);
      setError(null);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setNotifications(MOCK_NOTIFICATIONS);
      } catch (err) {
        setError("Failed to load notifications. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [isOpen]);

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function clearAll() {
    setNotifications([]);
  }

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div className="notifications-panel-overlay" onClick={onClose} />
      <div className="notifications-panel" role="region" aria-label="Notifications">
        <div className="notifications-header">
          <h2 className="notifications-title">Notifications</h2>
          <button
            className="notifications-close"
            onClick={onClose}
            aria-label="Close notifications panel"
          >
            <Icon name="close" size="md" tone="muted" />
          </button>
        </div>

        {error && (
          <div className="notifications-error" role="alert">
            <Icon name="alert" size="sm" tone="danger" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="notifications-loading">
            <div className="spinner" aria-label="Loading notifications" />
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="notifications-empty">
            <Icon name="bell" size="lg" tone="muted" />
            <p className="notifications-empty-text">No notifications yet</p>
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <>
            {unreadCount > 0 && (
              <div className="notifications-badge">
                {unreadCount} new {unreadCount === 1 ? "notification" : "notifications"}
              </div>
            )}

            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? "read" : "unread"}`}
                  onClick={() => markAsRead(notification.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    <Icon
                      name={getNotificationIcon(notification.type)}
                      size="md"
                      tone="accent"
                    />
                  </div>
                  <div className="notification-content">
                    <h3 className="notification-title">{notification.title}</h3>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{formatTime(notification.timestamp)}</span>
                  </div>
                  {!notification.read && <div className="notification-unread-indicator" />}
                </div>
              ))}
            </div>

            <div className="notifications-footer">
              <button className="notifications-btn" onClick={clearAll}>
                Clear All
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
