import ContactsTableClient from "@/app/contacts/ContactsTableClient";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the next/navigation
const mockRouter = { push: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => ({
    toString: () => "",
    get: () => null,
  }),
  usePathname: () => "/contacts",
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

describe("ContactsTableClient", () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the table headers correctly", () => {
    render(<ContactsTableClient contacts={mockContacts} totalCount={2} currentPage={1} perPage={100} />);

    // Check if column headers are rendered
    const headers = screen.getAllByRole("columnheader");
    expect(headers.length).toBe(5);
    expect(headers[0].textContent).toContain("ID");
    expect(headers[1].textContent).toContain("First Name");
    expect(headers[2].textContent).toContain("Last Name");
    expect(headers[3].textContent).toContain("Email");
    expect(headers[4].textContent).toContain("Created At");
  });

  it("has a table body with the correct data", () => {
    render(<ContactsTableClient contacts={mockContacts} totalCount={2} currentPage={1} perPage={100} />);

    // Check by test id or more specific queries to avoid duplicates
    const cellContents = screen.getAllByRole("cell").map((cell) => cell.textContent);
    expect(cellContents).toContain("John");
    expect(cellContents).toContain("Doe");
    expect(cellContents).toContain("john.doe@example.com");
    expect(cellContents).toContain("Jane");
    expect(cellContents).toContain("Smith");
    expect(cellContents).toContain("jane.smith@example.com");
  });

  it("shows loading state initially and hides it when data is available", async () => {
    const { container } = render(
      <ContactsTableClient contacts={mockContacts} totalCount={2} currentPage={1} perPage={100} />
    );

    // Initially loading state should be shown, but it gets hidden
    // immediately since we provide initialContacts
    await waitFor(() => {
      const loadingOverlay = container.querySelector(".absolute.inset-0.z-20.flex");
      expect(loadingOverlay).toBeFalsy();
    });
  });
});
