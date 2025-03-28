import type { SortingState } from "@tanstack/react-table";
import { getContactsWithPagination } from "./actions";
import ContactsTableClient from "./ContactsTableClient";

export type ContactsTableProps = {
  page?: number;
  perPage?: number;
  sort?: string;
  order?: "asc" | "desc";
};

export default async function ContactsTable({
  page = 1,
  perPage = 100,
  sort = "id",
  order = "asc",
}: ContactsTableProps) {
  // Convert URL params to SortingState
  const sorting: SortingState = sort ? [{ id: sort, desc: order === "desc" }] : [];

  // Convert page/perPage to limit/offset for data fetching
  const limit = perPage;
  const offset = (page - 1) * perPage;

  // Fetch data on the server
  const { contacts, totalCount } = await getContactsWithPagination(limit, offset, sorting);

  return (
    <ContactsTableClient
      contacts={contacts}
      totalCount={totalCount}
      currentPage={page}
      perPage={perPage}
      sorting={sorting}
    />
  );
}
