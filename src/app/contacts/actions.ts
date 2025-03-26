"use server";

import { Readable } from "node:stream";
import * as preparedStatements from "@/db/preparedStatements";
import { insertCSVQueue } from "@/queue";

export async function getContactsWithPagination(limit: number = 100, offset: number = 0) {
  const [contacts, countResult] = await Promise.all([
    preparedStatements.getContacts.execute({
      limit,
      offset,
    }),
    preparedStatements.getContactsCount.execute(),
  ]);

  return {
    contacts,
    totalCount: countResult[0].count,
    limit,
    offset,
  };
}

export async function importContacts(formData: FormData) {
  const csvFile = formData.get("csv") as File;
  const nodeStream = Readable.fromWeb(csvFile.stream());

  insertCSVQueue.push({
    csv: nodeStream,
    firstNameColumn: formData.get("firstName") as string,
    lastNameColumn: formData.get("lastName") as string,
    emailColumn: formData.get("email") as string,
  });
}
