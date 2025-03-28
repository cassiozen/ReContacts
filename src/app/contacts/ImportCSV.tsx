"use client";

import { Button, Select, showSuccessToast } from "@/components/ui";
import Link from "next/link";
import Papa from "papaparse";
import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { importContacts } from "./actions";

type FieldMapping = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

// Common field names for automatic column matching
const commonFieldNames = {
  firstName: [
    "first name",
    "firstname",
    "first_name",
    "first",
    "given name",
    "givenname",
    "forename",
    "name",
  ],
  lastName: [
    "last name",
    "lastname",
    "last_name",
    "last",
    "surname",
    "family name",
    "familyname",
  ],
  email: ["email", "email address", "emailaddress", "e-mail"],
};

// Button that uses the form status to automatically show loading state
function SubmitButton({ disabled = false }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Importing..." : "Import"}
    </Button>
  );
}

export default function ImportCSV() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({
    firstName: null,
    lastName: null,
    email: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseCSVPreview(file);
      setIsDialogOpen(true);
    }
  };

  const parseCSVPreview = (file: File) => {
    Papa.parse(file, {
      header: true,
      preview: 1, // Parse only first row for performance
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.meta.fields) {
          const headers = results.meta.fields;
          setParsedHeaders(headers);

          // Try to automatically match fields
          const newMapping: FieldMapping = {
            firstName: null,
            lastName: null,
            email: null,
          };

          // Attempt to match fields by common names
          headers.forEach((header) => {
            const headerLower = header.toLowerCase().trim();

            // Check field matches using the common names dictionary
            Object.entries(commonFieldNames).forEach(([field, names]) => {
              if (names.includes(headerLower)) {
                newMapping[field as keyof FieldMapping] = header;
              }
            });
          });

          setFieldMapping(newMapping);
        }
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
      },
    });
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setParsedHeaders([]);
    setFieldMapping({
      firstName: null,
      lastName: null,
      email: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMappingChange = (
    field: keyof FieldMapping,
    value: string | null,
  ) => {
    setFieldMapping((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const areHeadersMapped = () => {
    return (
      fieldMapping.firstName !== null &&
      fieldMapping.lastName !== null &&
      fieldMapping.email !== null
    );
  };

  const handleFormSubmit = async (formData: FormData) => {
    await importContacts(formData);
    setIsDialogOpen(false);

    showSuccessToast({
      header: "CSV Import Scheduled",
      description:
        "Your CSV file is being processed in the background. You can safely navigate away or close your browser.",
      footer: (
        <>
          Check the{" "}
          <Link
            href="/notifications"
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            notifications page
          </Link>{" "}
          for updates on the import process.
        </>
      ),
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <Button onClick={handleButtonClick} variant="primary">
        Import CSV
      </Button>

      <form action={handleFormSubmit}>
        {/* Hidden file input triggered by the button */}
        <input
          type="file"
          name="csv"
          ref={fileInputRef}
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {isDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
              <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                Import Contacts from CSV
              </h3>

              {parsedHeaders && (
                <div className="mb-6">
                  <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                    Map the contact fields to the CSV columns
                  </h4>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Select
                        name="firstName"
                        label="First Name"
                        value={fieldMapping.firstName || ""}
                        onChange={(e) =>
                          handleMappingChange(
                            "firstName",
                            e.target.value || null,
                          )
                        }
                        options={parsedHeaders.map((header) => ({
                          value: header,
                          label: header,
                        }))}
                        required
                        placeholder="Select column"
                      />

                      <Select
                        name="lastName"
                        label="Last Name"
                        value={fieldMapping.lastName || ""}
                        onChange={(e) =>
                          handleMappingChange(
                            "lastName",
                            e.target.value || null,
                          )
                        }
                        options={parsedHeaders.map((header) => ({
                          value: header,
                          label: header,
                        }))}
                        required
                        placeholder="Select column"
                      />

                      <Select
                        name="email"
                        label="Email"
                        value={fieldMapping.email || ""}
                        onChange={(e) =>
                          handleMappingChange("email", e.target.value || null)
                        }
                        options={parsedHeaders.map((header) => ({
                          value: header,
                          label: header,
                        }))}
                        required
                        placeholder="Select column"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <SubmitButton disabled={!areHeadersMapped()} />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
