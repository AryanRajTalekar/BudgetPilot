"use client";

import { useEffect, useState } from "react";
import { BellIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let lastFetchedAt = new Date().toISOString();
    let interval = 15000;
    let isActive = true;

    const fetchNotifications = async () => {
      if (!isActive) return;

      const res = await fetch(`/api/notifications?since=${lastFetchedAt}`);
      const data = await res.json();
      const newNotifications = data.notifications || [];

      if (newNotifications.length > 0) {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const filtered = newNotifications.filter(
            (n) => !existingIds.has(n.id),
          );
          return [...filtered, ...prev].slice(0, 50);
        });

        lastFetchedAt =
          newNotifications[newNotifications.length - 1].createdAt;

        interval = 15000;
      } else {
        interval = Math.min(interval + 5000, 60000);
      }

      setTimeout(fetchNotifications, interval);
    };

    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        const initial = data.notifications || [];
        setNotifications(initial);

        if (initial.length > 0) {
          lastFetchedAt = initial[initial.length - 1].createdAt;
        }

        fetchNotifications();
      });

    const handleVisibility = () => {
      isActive = !document.hidden;
      if (isActive) fetchNotifications();
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isActive = false;
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (open) {
      const unread = notifications.filter((n) => !n.read);

      if (unread.length === 0) return;

      fetch("/api/notifications/read", {
        method: "POST",
        body: JSON.stringify({ all: true }),
      });

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    }
  }, [open]);

  function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
    return `${Math.floor(seconds / 86400)} day(s) ago`;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      {/* 🔔 Bell */}
      <Button
        variant="outline"
        size="icon"
        className="relative"
        onClick={() => setOpen(!open)}
      >
        <BellIcon className="h-5 w-5" />

        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* 📥 Dropdown */}
      {open && (
        <div
          className="
          absolute right-0 mt-2 
          w-[90vw] sm:w-80 
          max-w-[320px]
          bg-white dark:bg-black 
          border rounded-xl shadow-xl 
          p-3 z-50
        "
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold">Notifications</h3>

            {notifications.length > 0 && (
              <button
                className="text-xs text-blue-500 hover:underline"
                onClick={async () => {
                  await fetch("/api/notifications/read", {
                    method: "POST",
                    body: JSON.stringify({ all: true }),
                  });

                  setNotifications((prev) =>
                    prev.map((n) => ({ ...n, read: true })),
                  );
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">
              No notifications
            </p>
          )}

          <div className="max-h-72 sm:max-h-80 overflow-y-auto pr-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={async () => {
                  await fetch("/api/notifications", {
                    method: "POST",
                    body: JSON.stringify({ id: n.id }),
                  });

                  setNotifications((prev) =>
                    prev.map((item) =>
                      item.id === n.id ? { ...item, read: true } : item,
                    ),
                  );
                }}
                className={`p-3 rounded-lg mb-2 cursor-pointer transition border text-sm ${
                  n.read
                    ? "bg-gray-50 dark:bg-neutral-900 border-transparent"
                    : "bg-blue-50 dark:bg-neutral-800 border-blue-200"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="font-medium">{n.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {n.message}
                    </p>
                  </div>

                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}