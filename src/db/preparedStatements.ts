import { sql, count, desc, eq } from "drizzle-orm";
import db, { contacts, notifications } from ".";

export const getContactsCount = db.select({ count: count() }).from(contacts).prepare("getContactsCountPrepared");

export const getNotifications = db
  .select()
  .from(notifications)
  .where(eq(notifications.dismissed, false))
  .orderBy(desc(notifications.createdAt))
  .prepare("getNotificationsPrepared");

export const dismissNotification = db
  .update(notifications)
  .set({ dismissed: true })
  .where(eq(notifications.id, sql.placeholder("id")))
  .prepare("dismissNotificationPrepared");
