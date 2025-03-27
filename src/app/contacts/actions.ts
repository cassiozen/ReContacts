"use server";

import { Readable } from "node:stream";
import * as preparedStatements from "@/db/preparedStatements";
import { insertCSVQueue } from "@/queue";
import db, { contacts, Contact } from "@/db";
import { desc } from "drizzle-orm";
import { type SortingState } from "@tanstack/react-table";

export async function getContactsWithPagination(limit: number = 100, offset: number = 0, sorting?: SortingState) {
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
  const [contactsResult, countResult] = await Promise.all([query, preparedStatements.getContactsCount.execute()]);

  return {
    contacts: contactsResult,
    totalCount: countResult[0].count,
    limit,
    offset,
  };
}

export async function importContacts(formData: FormData) {
  const csvFile = formData.get("csv") as File;
  const nodeStream = Readable.fromWeb(csvFile.stream());

  insertCSVQueue.push({
    id: csvFile.name,
    csv: nodeStream,
    firstNameColumn: formData.get("firstName") as string,
    lastNameColumn: formData.get("lastName") as string,
    emailColumn: formData.get("email") as string,
  });
}
