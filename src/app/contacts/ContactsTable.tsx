"use client";

import { createColumnHelper, flexRender, getCoreRowModel, Row, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useState } from "react";
import type { Contact } from "@/db";
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
  }),
  columnHelper.accessor("createdAt", {
    cell: (info) => {
      const date = info.getValue();
      return date instanceof Date ? date.toLocaleString() : "N/A";
    },
    header: "Created At",
    size: 200,
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
    overscan: 5,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();

  // Handle page change
  const handlePageChange = async (page: number) => {
    if (page < 1 || page > totalPages) return;

    const newOffset = (page - 1) * limit;
    setLoading(true);

    try {
      const result = await getContactsWithPagination(limit, newOffset);
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
      const result = await getContactsWithPagination(newLimit, 0);
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
    <div className="w-full max-w-4xl mx-auto">
      <div
        className="rounded-md border border-gray-200 dark:border-gray-700 overflow-x-auto h-[600px] w-full relative"
        ref={tableContainerRef}
      >
        {loading && (
          <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          </div>
        )}
        <table className="w-full grid divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    style={{
                      width: header.getSize(),
                    }}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody
            style={{
              display: "grid",
              height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
              position: "relative", //needed for absolute positioning of rows
            }}
            className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
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
                    transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
                    width: "100%",
                  }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={cell.id}
                        style={{
                          display: "flex",
                          width: cell.column.getSize(),
                          maxWidth: cell.column.getSize(),
                        }}
                        className="px-6 py-4 whitespace-nowrap truncate text-sm text-gray-500 dark:text-gray-300"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
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
        offset={offset}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        isLoading={loading}
        totalItems={totalItems}
      />
    </div>
  );
}
