import ContactsTable from "./ContactsTable";
import ImportCSV from "./ImportCSV";
import { getContactsWithPagination } from "./actions";

const DEFAULT_LIMIT = 100;

export default async function ContactsPage() {
  const { contacts, totalCount, limit, offset } = await getContactsWithPagination(DEFAULT_LIMIT, 0);
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contacts List</h1>
        <ImportCSV />
      </div>
      <ContactsTable initialContacts={contacts} totalCount={totalCount} initialLimit={limit} initialOffset={offset} />
    </div>
  );
}
