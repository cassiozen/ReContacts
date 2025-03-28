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
import { useRef, useState } from "react";
import Pagination from "./Pagination";
import { getContactsWithPagination } from "./actions";

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
      return date instanceof Date ? date.toLocaleString() : "N/A";
    },
    header: "Created At",
    size: 200,
    enableSorting: false,
  }),
];

type ContactsTableProps = {
  initialContacts: Contact[];
  totalCount: number;
  initialLimit?: number;
  initialOffset?: number;
};

export default function ContactsTable({
  initialContacts,
  totalCount,
  initialLimit = 100,
  initialOffset = 0,
}: ContactsTableProps) {
  const [data, setData] = useState(initialContacts);
  const [limit, setLimit] = useState(initialLimit);
  const [offset, setOffset] = useState(initialOffset);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(totalCount);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Calculate current page and total pages
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalItems / limit);

  //we need a reference to the scrolling element for logic down below
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    estimateSize: () => 33, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    measureElement: (element) => element?.getBoundingClientRect().height,
    overscan: 10,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    state: {
      sorting,
    },
    onSortingChange: (updaterOrValue) => {
      const newSortingState = typeof updaterOrValue === "function" ? updaterOrValue(sorting) : updaterOrValue;
      setSorting(newSortingState);
      handlePageChange(1, newSortingState);
    },
    enableSorting: true,
  });

  const { rows } = table.getRowModel();

  // Handle page change
  const handlePageChange = async (page: number, sortingState: SortingState = sorting) => {
    if (page < 1 || page > totalPages) return;

    const newOffset = (page - 1) * limit;
    setLoading(true);

    try {
      const result = await getContactsWithPagination(limit, newOffset, sortingState);
      setData(result.contacts);
      setOffset(newOffset);
      setTotalItems(result.totalCount);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle limit change
  const handleLimitChange = async (newLimit: number) => {
    setLimit(newLimit);
    setLoading(true);
    try {
      // Reset to first page when limit changes
      const result = await getContactsWithPagination(newLimit, 0, sorting);
      setData(result.contacts);
      setOffset(0);
      setTotalItems(result.totalCount);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div
        className="relative h-[600px] w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700"
        ref={tableContainerRef}
      >
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 dark:bg-gray-800/50">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
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
        limit={limit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        isLoading={loading}
        totalItems={totalItems}
      />
    </div>
  );
}
