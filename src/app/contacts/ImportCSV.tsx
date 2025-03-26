"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import Link from "next/link";
import { importContacts } from "./actions";
import { Button, Select } from "@/components/ui";

type FieldMapping = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

// Common field names for automatic column matching
const commonFieldNames = {
  firstName: ["first name", "firstname", "first_name", "first", "given name", "givenname", "forename", "name"],
  lastName: ["last name", "lastname", "last_name", "last", "surname", "family name", "familyname"],
  email: ["email", "email address", "emailaddress", "e-mail"],
};

export default function ImportCSV() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
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
            // Check for firstName match
            if (commonFieldNames.firstName.some((name) => headerLower === name)) {
              newMapping.firstName = header;
            }
            // Check for lastName match
            else if (commonFieldNames.lastName.some((name) => headerLower === name)) {
              newMapping.lastName = header;
            }
            // Check for email match
            else if (commonFieldNames.email.some((name) => headerLower === name)) {
              newMapping.email = header;
            }
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

  const handleMappingChange = (field: keyof FieldMapping, value: string | null) => {
    setFieldMapping((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const areHeadersMapped = () => {
    return fieldMapping.firstName !== null && fieldMapping.lastName !== null && fieldMapping.email !== null;
  };

  const handleFormSubmit = async (formData: FormData) => {
    await importContacts(formData);
    setIsDialogOpen(false);
    setIsImporting(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mt-4">
      <Button onClick={handleButtonClick} variant="primary">
        Import CSV
      </Button>

      {isImporting && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-green-800 font-medium">CSV Import Scheduled</h3>
          <p className="text-green-700 mt-1">
            Your CSV file is being processed in the background. You can safely navigate away or close your browser.
          </p>
          <p className="text-green-700 mt-2">
            Check the{" "}
            <Link href="/notifications" className="text-blue-600 hover:underline font-medium">
              notifications page
            </Link>{" "}
            for updates on the import process.
          </p>
        </div>
      )}

      <form action={handleFormSubmit}>
        <input type="file" name="csv" ref={fileInputRef} accept=".csv" onChange={handleFileChange} className="hidden" />
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full shadow-xl">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-800 dark:text-gray-200">
                Import Contacts from CSV
              </h3>

              {parsedHeaders && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Map the contact fields to the CSV columns
                  </h4>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select
                        name="firstName"
                        label="First Name"
                        value={fieldMapping.firstName || ""}
                        onChange={(e) => handleMappingChange("firstName", e.target.value || null)}
                        options={parsedHeaders.map((header) => ({ value: header, label: header }))}
                        required
                        placeholder="Select column"
                      />

                      <Select
                        name="lastName"
                        label="Last Name"
                        value={fieldMapping.lastName || ""}
                        onChange={(e) => handleMappingChange("lastName", e.target.value || null)}
                        options={parsedHeaders.map((header) => ({ value: header, label: header }))}
                        required
                        placeholder="Select column"
                      />

                      <Select
                        name="email"
                        label="Email"
                        value={fieldMapping.email || ""}
                        onChange={(e) => handleMappingChange("email", e.target.value || null)}
                        options={parsedHeaders.map((header) => ({ value: header, label: header }))}
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
                <Button type="submit" disabled={!areHeadersMapped()}>
                  Import
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
