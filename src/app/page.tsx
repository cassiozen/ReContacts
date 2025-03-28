import { Suspense } from "react";
import ContactsTable from "./contacts/ContactsTable";
import ImportCSV from "./contacts/ImportCSV";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Page(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  const page = parseInt((searchParams.page as string) || "1", 10);
  const perPage = parseInt((searchParams.perPage as string) || "500", 10);
  const sort = (searchParams.sort as string) || "id";
  const order = (searchParams.order as string) === "desc" ? "desc" : "asc"; // Makes sure it's either one or the other

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between">
        <h1 className="text-2xl font-bold">Contacts List</h1>
        <ImportCSV />
      </div>
      <Suspense fallback={<div>Loading contacts...</div>}>
        <ContactsTable page={page} perPage={perPage} sort={sort} order={order} />
      </Suspense>
    </div>
  );
}
