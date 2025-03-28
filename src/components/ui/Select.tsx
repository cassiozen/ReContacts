"use client";

import React from "react";

type SelectProps = {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  className?: string;
  placeholder?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({
  name,
  label,
  value,
  onChange,
  options,
  required = false,
  className = "",
  placeholder = "Select an option",
  ...props
}: SelectProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}

        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full rounded-md border border-gray-300 bg-white p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 ${className}`}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={`${name}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
