"use client";

import { Button } from "@/components/ui";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  limit: number;
  offset: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
};

export default function Pagination({
  currentPage,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
  isLoading = false,
}: PaginationProps) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages || totalPages === 0;
  const isDisabled = isLoading || isFirstPage;
  const isLastDisabled = isLoading || isLastPage;

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(e.target.value);
    if (!isNaN(newLimit) && newLimit > 0) {
      onLimitChange(newLimit);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6 mt-2 w-full">
      <div className="flex flex-1 items-center sm:justify-between">
        <div className="flex items-center">
          {/* Fixed-width container for pagination info to prevent movement */}
          <div className="w-48">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{totalPages || 1}</span>
            </span>
          </div>

          {/* Fixed position for limit controls */}
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Limit:</span>
            <input
              type="number"
              min="1"
              value={limit}
              disabled={isLoading}
              onChange={handleLimitChange}
              className="w-16 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-gray-200 sm:text-sm p-1"
            />
          </div>
        </div>

        <div>
          <nav className="isolate inline-flex rounded-md shadow-sm" aria-label="Pagination">
            <Button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={isDisabled}
              variant="secondary"
              className="rounded-l-md rounded-r-none px-2 py-2 border-r-0"
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
            <Button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={isLastDisabled}
              variant="secondary"
              className="rounded-r-md rounded-l-none px-2 py-2"
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
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
