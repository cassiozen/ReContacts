"use server";

import db, { Contact, contacts } from "@/db";
import * as preparedStatements from "@/db/preparedStatements";
import { insertCSVQueue } from "@/queue";
import { type SortingState } from "@tanstack/react-table";
import { desc } from "drizzle-orm";
import { Readable } from "node:stream";
import type { ReadableStream } from "node:stream/web";

export async function getContactsWithPagination(
  limit: number = 250,
  offset: number = 0,
  sorting?: SortingState,
) {
  const query = db.select().from(contacts);

  // Apply sorting if provided - only allow sorting by ID, firstName, and lastName
  // Handle sorting safely to avoid server component errors
  if (sorting && Array.isArray(sorting) && sorting[0]) {
    const sortItem = sorting[0];
    const sortColumn = sortItem.id as keyof Contact;
    const isDesc = sortItem.desc;
    if (isDesc) {
      query.orderBy(desc(contacts[sortColumn]));
    } else {
      query.orderBy(contacts[sortColumn]);
    }
  } else {
    // Default sort by id
    query.orderBy(contacts.id);
  }

  // Apply pagination
  query.limit(limit).offset(offset);

  // Execute the query and get the count
  const [contactsResult, countResult] = await Promise.all([
    query,
    preparedStatements.getContactsCount.execute(),
  ]);

  return {
    contacts: contactsResult,
    totalCount: countResult[0].count,
    limit,
    offset,
  };
}

export async function importContacts(formData: FormData) {
  const csvFile = formData.get("csv") as File;
  // Type assertion needed because csvFile.stream() returns a browser-compatible ReadableStream,
  // while Readable.fromWeb() expects Node's ReadableStream implementation.
  const webStream = csvFile.stream() as ReadableStream<Uint8Array>;
  const nodeStream = Readable.fromWeb(webStream);

  insertCSVQueue.push({
    id: csvFile.name,
    csv: nodeStream,
    firstNameColumn: formData.get("firstName") as string,
    lastNameColumn: formData.get("lastName") as string,
    emailColumn: formData.get("email") as string,
  });
}
