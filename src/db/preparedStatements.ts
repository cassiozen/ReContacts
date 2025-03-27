import { sql, count, eq } from "drizzle-orm";
import db, { contacts, notifications } from ".";

export const getContactsCount = db.select({ count: count() }).from(contacts).prepare("getContactsCountPrepared");

export const getNotificationsCount = db
  .select({ count: count() })
  .from(notifications)
  .where(eq(notifications.dismissed, false))
  .prepare("getNotificationsCountPrepared");

export const dismissNotification = db
  .update(notifications)
  .set({ dismissed: true })
  .where(eq(notifications.id, sql.placeholder("id")))
  .prepare("dismissNotificationPrepared");
