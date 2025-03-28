export const dynamic = "force-dynamic";
import ContactsTable from "./contacts/ContactsTable";
import ImportCSV from "./contacts/ImportCSV";
import { getContactsWithPagination } from "./contacts/actions";

const DEFAULT_LIMIT = 100;

export default async function Page() {
  const { contacts, totalCount, limit, offset } =
    await getContactsWithPagination(DEFAULT_LIMIT, 0);
  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between">
        <h1 className="text-2xl font-bold">Contacts List</h1>
        <ImportCSV />
      </div>
      <ContactsTable
        initialContacts={contacts}
        totalCount={totalCount}
        initialLimit={limit}
        initialOffset={offset}
      />
    </div>
  );
}
