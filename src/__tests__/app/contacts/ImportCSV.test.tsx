import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ImportCSV from "@/app/contacts/ImportCSV";
import Papa from "papaparse";
import { showSuccessToast } from "@/components/ui";

// Mock papaparse
vi.mock("papaparse", () => ({
  default: {
    parse: vi.fn(),
  },
}));

// Mock the actions module
vi.mock("@/app/contacts/actions", () => ({
  importContacts: vi.fn(),
}));

// Mock the showSuccessToast
vi.mock("@/components/ui", async () => {
  const actual = await vi.importActual("@/components/ui");
  return {
    ...actual,
    showSuccessToast: vi.fn(),
  };
});

// Helper function to simulate selecting a CSV file with specific fields
const selectCSVFile = (fields: string[]) => {
  const file = new File([""], "test.csv", { type: "text/csv" });

  // Mock Papa parse implementation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(Papa.parse).mockImplementation((file: any, options: any) => {
    if (options.complete) {
      options.complete({
        data: [{}],
        meta: { fields },
      });
    }
    return undefined as unknown as ReturnType<typeof Papa.parse>;
  });

  // Click the import button and select a file
  const importButton = screen.getByText("Import CSV");
  fireEvent.click(importButton);

  // Get the hidden file input and simulate a file selection
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(fileInput, { target: { files: [file] } });
};

describe("ImportCSV", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the Import CSV button", () => {
    render(<ImportCSV />);
    expect(screen.getByText("Import CSV")).toBeDefined();
  });

  it("opens dialog when file is selected", () => {
    render(<ImportCSV />);
    selectCSVFile(["Name", "Surname", "Contact"]);

    // Dialog should be open
    expect(screen.getByText("Import Contacts from CSV")).toBeDefined();
  });

  it("automatically maps common field names", () => {
    render(<ImportCSV />);
    selectCSVFile(["first name", "last name", "email address"]);

    // The fields should be automatically mapped
    const firstNameSelect = screen.getByLabelText("First Name");
    const lastNameSelect = screen.getByLabelText("Last Name");
    const emailSelect = screen.getByLabelText("Email");

    expect(firstNameSelect).toHaveValue("first name");
    expect(lastNameSelect).toHaveValue("last name");
    expect(emailSelect).toHaveValue("email address");
  });

  it("allows manual mapping of fields", () => {
    render(<ImportCSV />);
    selectCSVFile(["Name", "Surname", "Contact"]);

    // The import button should be disabled while fields are not mapped
    expect(screen.getByText("Import")).toBeDisabled();

    // Manually map the fields
    const firstNameSelect = screen.getByLabelText("First Name");
    const lastNameSelect = screen.getByLabelText("Last Name");
    const emailSelect = screen.getByLabelText("Email");

    fireEvent.change(firstNameSelect, { target: { value: "Name" } });
    fireEvent.change(lastNameSelect, { target: { value: "Surname" } });
    fireEvent.change(emailSelect, { target: { value: "Contact" } });

    // The import button should be enabled after mapping all required fields
    expect(screen.getByText("Import")).not.toBeDisabled();
  });

  it("closes dialog when cancel is clicked", () => {
    render(<ImportCSV />);
    selectCSVFile(["Name", "Email", "Last"]);

    // Click cancel
    fireEvent.click(screen.getByText("Cancel"));

    // Dialog should be closed
    expect(screen.queryByText("Import Contacts from CSV")).toBeNull();
  });

  it("shows toast notification after submitting the form", async () => {
    render(<ImportCSV />);
    selectCSVFile(["first name", "last name", "email address"]);

    // Click cancel
    fireEvent.click(screen.getByText("Import"));

    await waitFor(() => {
      // Dialog should be closed
      expect(screen.queryByText("Import Contacts from CSV")).toBeNull();
    });

    // Check that the success toast was called
    expect(showSuccessToast).toHaveBeenCalledWith(
      expect.objectContaining({
        header: "CSV Import Scheduled",
      })
    );
  });
});
