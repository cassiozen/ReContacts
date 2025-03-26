"use client";

import { useState } from "react";
import type { notifications } from "@/db/schema";
import { dismissNotification } from "./actions";
import { Button } from "@/components/ui";

type NotificationsListProps = {
  notifications: typeof notifications.$inferSelect[];
};

export default function NotificationsList({ notifications: initialNotifications }: NotificationsListProps) {
  const [notifications, setNotifications] = useState(initialNotifications);

  if (notifications.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No new notifications.</p>;
  }

  const handleDismiss = async (id: number) => {
    await dismissNotification(id);
    setNotifications(notifications.filter(notification => notification.id !== id));
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
            <Button
              variant="secondary"
              onClick={() => handleDismiss(notification.id)}
              className="px-3 py-1 text-sm"
            >
              Dismiss
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}