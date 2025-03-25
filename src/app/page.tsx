import ContactsTable from "@/components/ContactsTable";
import { getContactsWithPagination } from "./actions";

const DEFAULT_LIMIT = 100;

export default async function ContactsPage() {
  const { contacts, totalCount, limit, offset } = await getContactsWithPagination(DEFAULT_LIMIT, 0);
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Contacts List</h1>
      <ContactsTable initialContacts={contacts} totalCount={totalCount} initialLimit={limit} initialOffset={offset} />
    </div>
  );
}
