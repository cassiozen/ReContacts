import db, { notifications as notificationsTable } from "@/db";
import NotificationsList from "./NotificationsList";
import { desc, eq } from "drizzle-orm";

export default async function NotificationsPage() {
  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.dismissed, false))
    .orderBy(desc(notificationsTable.createdAt));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <NotificationsList notifications={notifications} />
    </div>
  );
}
