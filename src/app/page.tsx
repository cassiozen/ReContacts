import db, { contacts } from "@/db";
import { asc } from "drizzle-orm";
import ContactsTable from "@/components/ContactsTable";

export default async function ContactsPage() {
  const contactsList = await db
    .select()
    .from(contacts)
    .orderBy(asc(contacts.lastName), asc(contacts.firstName))
    .limit(300);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Contacts List</h1>
      <ContactsTable contacts={contactsList} />
    </div>
  );
}
