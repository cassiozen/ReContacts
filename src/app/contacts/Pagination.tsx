"use client";

import { Button } from "@/components/ui";
import { debounce } from "@/lib/debounce";
import { useMemo, useState } from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
  totalItems?: number;
};

export default function Pagination({
  currentPage,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
  isLoading = false,
  totalItems = 0,
}: PaginationProps) {
  const [pageInput, setPageInput] = useState(currentPage.toString());
  const [limitInput, setLimitInput] = useState(limit.toString());

  // Update inputs when props change
  useMemo(() => {
    setPageInput(currentPage.toString());
    setLimitInput(limit.toString());
  }, [currentPage, limit]);

  const debouncedPageChange = useMemo(
    () =>
      debounce((page: number) => {
        if (page > 0 && page <= totalPages) {
          onPageChange(page);
        }
      }, 350),
    [onPageChange, totalPages]
  );

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
    const page = parseInt(e.target.value);
    if (!isNaN(page)) {
      debouncedPageChange(page);
    }
  };

  const debouncedLimitChange = useMemo(
    () =>
      debounce((newLimit: number) => {
        if (newLimit > 0) {
          onLimitChange(newLimit);
        }
      }, 350),
    [onLimitChange]
  );

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLimitInput(value);

    const newLimit = parseInt(value);
    if (!isNaN(newLimit) && newLimit > 0) {
      debouncedLimitChange(newLimit);
    }
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages || totalPages === 0;

  // Simple calculation for displaying record range
  const startRecord = isFirstPage ? 1 : (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, totalItems);

  return (
    <div className="flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 mt-2 w-full">
      <div className="flex flex-1 items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center" data-testid="pagination-info">
          Showing {startRecord.toLocaleString()} - {endRecord.toLocaleString()} of {totalItems.toLocaleString()} records
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Per Page:</span>{" "}
            <input
              type="number"
              min="10"
              step="10"
              value={limitInput}
              disabled={isLoading}
              onChange={handleLimitChange}
              data-testid="pagination-limit"
              className="w-16 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-gray-200 text-sm p-1"
            />
          </div>
          <div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page{" "}
              <input
                type="text"
                value={pageInput}
                onChange={handlePageInputChange}
                className="w-12 inline-block text-center font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-gray-200 text-sm p-1"
              />{" "}
              of{" "}
              <span className="font-medium" data-testid="pagination-total">
                {totalPages || 1}
              </span>
            </span>
          </div>

          <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
            <Button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={isLoading || isFirstPage}
              variant="secondary"
              className="rounded-l-md rounded-r-none px-2 py-2 border-r-0"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
            <Button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={isLoading || isLastPage}
              variant="secondary"
              className="rounded-r-md rounded-l-none px-2 py-2"
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}
