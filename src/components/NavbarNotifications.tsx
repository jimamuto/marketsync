"use client";

import { useEffect, useState } from "react";

type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

function formatNotificationDate(value: string) {
  return new Date(value).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
  });
}

export default function NavbarNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");

  async function loadNotifications() {
    try {
      const response = await fetch("/api/notifications", { credentials: "include" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load notifications");
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load notifications");
    }
  }

  useEffect(() => {
    void loadNotifications();
  }, []);

  async function markAsRead(notificationId: number) {
    await fetch(`/api/notifications/${notificationId}/read`, {
      method: "PATCH",
      credentials: "include",
    });
    await loadNotifications();
  }

  async function markAllAsRead() {
    await fetch("/api/notifications/read-all", {
      method: "PATCH",
      credentials: "include",
    });
    await loadNotifications();
  }

  return (
    <div className="navbar-notifications">
      <button
        type="button"
        className="navbar-notification-button"
        aria-label="Open notifications"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span aria-hidden="true">🔔</span>
        {unreadCount > 0 && <span className="navbar-notification-count">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="navbar-notification-menu" aria-label="Notifications">
          <div className="navbar-notification-header">
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllAsRead}>
                Mark all read
              </button>
            )}
          </div>

          {error && <p className="navbar-notification-message">{error}</p>}

          {!error && notifications.length === 0 && (
            <p className="navbar-notification-message">No notifications yet.</p>
          )}

          {!error && notifications.length > 0 && (
            <div className="navbar-notification-list">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={`navbar-notification-item ${notification.is_read ? "is-read" : "is-unread"}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <span>
                    <strong>{notification.title}</strong>
                    <small>{formatNotificationDate(notification.created_at)}</small>
                  </span>
                  <span>{notification.message}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
