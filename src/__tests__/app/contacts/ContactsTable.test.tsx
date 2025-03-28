import ContactsTable from "@/app/contacts/ContactsTable";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Mock the actions module
vi.mock("@/app/contacts/actions", () => ({
  getContactsWithPagination: vi.fn(),
}));

// Mock the virtualizer
vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [
      { index: 0, start: 0, end: 0, size: 0, measureElement: () => {} },
      { index: 1, start: 0, end: 0, size: 0, measureElement: () => {} },
    ],
    getTotalSize: () => 66,
    measureElement: () => {},
  }),
}));

describe("ContactsTable", () => {
  afterEach(() => {
    cleanup();
  });

  const mockContacts = [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      createdAt: new Date("2023-01-01"),
      updatedAt: new Date("2023-01-01"),
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      createdAt: new Date("2023-01-02"),
      updatedAt: new Date("2023-01-02"),
    },
  ];

  it("renders the table headers correctly", () => {
    render(<ContactsTable initialContacts={mockContacts} totalCount={2} />);

    // Check if column headers are rendered
    expect(screen.getByText("ID")).toBeDefined();
    expect(screen.getByText("First Name")).toBeDefined();
    expect(screen.getByText("Last Name")).toBeDefined();
    expect(screen.getByText("Email")).toBeDefined();
    expect(screen.getByText("Created At")).toBeDefined();
  });

  it("has a table body with exactly two rows", () => {
    render(<ContactsTable initialContacts={mockContacts} totalCount={2} />);

    expect(screen.getByText("John")).toBeDefined();
    expect(screen.getByText("Doe")).toBeDefined();
    expect(screen.getByText("john.doe@example.com")).toBeDefined();

    expect(screen.getByText("Jane")).toBeDefined();
    expect(screen.getByText("Smith")).toBeDefined();
    expect(screen.getByText("jane.smith@example.com")).toBeDefined();
  });
});
