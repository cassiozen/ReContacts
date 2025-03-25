import { sql, count } from "drizzle-orm";
import db, { contacts } from ".";

export const getContacts = db
  .select()
  .from(contacts)
  .limit(sql.placeholder("limit"))
  .offset(sql.placeholder("offset"))
  .prepare("getContactsPrepared");

export const getContactsCount = db.select({ count: count() }).from(contacts).prepare("getContactsCountPrepared");
