"use client";

import { ReactNode } from "react";
import { toast, ToastOptions } from "react-toastify";

// Success icon SVG component
const SuccessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

// Default toast options
const defaultToastOptions: ToastOptions = {
  className: "p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg w-96",
  closeOnClick: true,
  draggable: true,
  position: "bottom-right",
};

interface SuccessToastProps {
  header: string;
  description: string | ReactNode;
  footer?: ReactNode;
  options?: ToastOptions;
}

export function showSuccessToast({ header, description, footer, options }: SuccessToastProps) {
  const toastOptions = { ...defaultToastOptions, ...options };

  return toast(
    <div className="flex items-start">
      <div className="mr-3 shrink-0 text-green-500">
        <SuccessIcon />
      </div>
      <div>
        <h2 className="text-lg font-semibold">{header}</h2>
        <div className="mt-2 text-sm leading-relaxed">{description}</div>
        {footer && <div className="mt-2 text-sm">{footer}</div>}
      </div>
    </div>,
    toastOptions
  );
}
