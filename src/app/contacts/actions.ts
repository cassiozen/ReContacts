"use server";

import * as preparedStatements from "@/db/preparedStatements";

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
