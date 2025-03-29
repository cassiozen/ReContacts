"use client";

import type { Contact } from "@/db";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useTransition } from "react";
import Pagination from "./Pagination";

// Create a column helper
const columnHelper = createColumnHelper<Contact>();

// Define columns for the table
const columns = [
  columnHelper.accessor("id", {
    cell: (info) => info.getValue(),
    header: "ID",
    size: 80,
  }),
  columnHelper.accessor("firstName", {
    cell: (info) => info.getValue(),
    header: "First Name",
    size: 170,
  }),
  columnHelper.accessor("lastName", {
    cell: (info) => info.getValue(),
    header: "Last Name",
    size: 170,
  }),
  columnHelper.accessor("email", {
    cell: (info) => info.getValue(),
    header: "Email",
    size: 280,
    enableSorting: false,
  }),
  columnHelper.accessor("createdAt", {
    cell: (info) => {
      const date = info.getValue();
      return date instanceof Date ? date.toLocaleString("en-US", { timeZone: "UTC" }) : "N/A";
    },
    header: "Created At",
    size: 200,
    enableSorting: false,
  }),
];

type ContactsTableClientProps = {
  contacts: Contact[];
  totalCount: number;
  currentPage: number;
  perPage: number;
  sorting?: SortingState;
};

export default function ContactsTableClient({
  contacts: contacts,
  totalCount: totalItems,
  currentPage,
  perPage,
  sorting: initialSorting = [],
}: ContactsTableClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(totalItems / perPage);

  // Reference to the scrolling element for virtualization
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: contacts.length,
    estimateSize: () => 53, // estimate row height for SSR & accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    measureElement: (element) => element?.getBoundingClientRect().height,
    overscan: 10,
    initialRect: { width: 894, height: 600 }, // Initial dimensions for SSR
  });

  const table = useReactTable({
    data: contacts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    state: {
      sorting: initialSorting,
    },
    onSortingChange: (updaterOrValue) => {
      const newSortingState = typeof updaterOrValue === "function" ? updaterOrValue(initialSorting) : updaterOrValue;

      const sortColumn = newSortingState[0]?.id || "id";
      const sortOrder = newSortingState[0]?.desc ? "desc" : "asc";

      // Navigate to the new page with updated sort parameters
      handleParamChange({ sort: sortColumn, order: sortOrder, page: 1 });
    },
    enableSorting: true,
  });

  const { rows } = table.getRowModel();

  // Helper function to update URL parameters and navigate
  const handleParamChange = (params: Record<string, string | number>) => {
    // Create new URLSearchParams object from current params
    const newParams = new URLSearchParams(searchParams.toString());

    // Update with new values
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        newParams.set(key, value.toString());
      } else {
        newParams.delete(key);
      }
    });

    // Navigate to the new URL with transition for loading state
    startTransition(() => {
      router.push(`${pathname}?${newParams.toString()}`);
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;

    handleParamChange({ page });
  };

  // Handle perPage change (previously limit)
  const handleLimitChange = (newPerPage: number) => {
    // Reset to page 1 when changing items per page
    handleParamChange({ perPage: newPerPage, page: 1 });
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div
        className="relative h-[600px] w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700"
        ref={tableContainerRef}
      >
        {isPending && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/75 dark:bg-gray-900/75">
            <div
              className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent align-[-0.125em]"
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
        <table className="grid w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    style={{ width: header.getSize() }}
                    className={`px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300 ${
                      header.column.getCanSort() ? "cursor-pointer" : ""
                    }`}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <div className="group flex items-center space-x-1 select-none">
                      <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                      {header.column.getCanSort() && (
                        <span className="ml-1 text-gray-400">
                          {header.column.getIsSorted() ? (
                            { asc: " ▲", desc: " ▼" }[header.column.getIsSorted() as string]
                          ) : (
                            <span className="opacity-0 transition-opacity group-hover:opacity-50"> ▲</span>
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody
            style={{
              display: "grid",
              height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
              position: "relative",
            }}
            className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900"
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index] as Row<Contact>;
              return (
                <tr
                  data-index={virtualRow.index} //needed for dynamic row height measurement
                  ref={(node) => rowVirtualizer.measureElement(node)} //measure dynamic row height
                  key={row.id}
                  style={{
                    display: "flex",
                    position: "absolute",
                    transform: `translateY(${virtualRow.start}px)`,
                    width: "100%",
                  }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        display: "flex",
                        width: cell.column.getSize(),
                        maxWidth: cell.column.getSize(),
                      }}
                      className="truncate px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        limit={perPage}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        totalItems={totalItems}
        isLoading={isPending}
      />
    </div>
  );
}
