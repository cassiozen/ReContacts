"use client";

import { useEffect } from "react";
import type { notifications } from "@/db/schema";
import { dismissNotification } from "./actions";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";

type NotificationsListProps = {
  notifications: (typeof notifications.$inferSelect)[];
};

export default function NotificationsList({ notifications: notifications }: NotificationsListProps) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/notifications/meta");
      const data = await res.json();

      if (notifications.length !== data.count) {
        // There's new data, so let's refresh the page
        router.refresh();
      }
    }, 3_000);

    return () => clearInterval(interval);
  }, [router, notifications.length]);

  if (notifications.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No new notifications.</p>;
  }

  const handleDismiss = async (id: number) => {
    await dismissNotification(id);
  };

  return (
    <ul className="space-y-4">
      {notifications.map((notification) => (
        <li key={notification.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow dark:shadow-gray-700/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium dark:text-gray-100">{notification.content}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(notification.createdAt!).toLocaleString()}
              </p>
            </div>
            <Button variant="secondary" onClick={() => handleDismiss(notification.id)} className="px-3 py-1 text-sm">
              Dismiss
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
