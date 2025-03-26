import { getNotifications } from "@/db/preparedStatements";
import NotificationsList from "./NotificationsList";

export default async function NotificationsPage() {
  const notifications = await getNotifications.execute();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <NotificationsList notifications={notifications} />
    </div>
  );
}