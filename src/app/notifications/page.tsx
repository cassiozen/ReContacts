import db, { notifications as notificationsTable } from "@/db";
import { desc, eq } from "drizzle-orm";
import NotificationsList from "./NotificationsList";

export default async function NotificationsPage() {
  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.dismissed, false))
    .orderBy(desc(notificationsTable.createdAt));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Notifications</h1>
      <NotificationsList notifications={notifications} />
    </div>
  );
}
