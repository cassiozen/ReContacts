import Pagination from "@/app/contacts/Pagination";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("Pagination", () => {
  const mockProps = {
    currentPage: 2,
    totalPages: 5,
    limit: 10,
    onPageChange: vi.fn(),
    onLimitChange: vi.fn(),
    totalItems: 50,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page buttons correctly", () => {
    const { container } = render(<Pagination {...mockProps} />);

    // Find the navigation and buttons
    const nav = container.querySelector("nav");
    expect(nav).toBeDefined();

    // Verify text content shows record range
    expect(screen.getByTestId("pagination-info").textContent).toContain("Showing 11 - 20 of 50 records");

    // Check that total pages are displayed
    expect(screen.getByTestId("pagination-total").textContent).toContain("5");
  });

  it("allows changing limit", () => {
    render(<Pagination {...mockProps} />);
    // Find the limit input
    const limitInput = screen.getByTestId("pagination-limit");

    if (limitInput) {
      fireEvent.change(limitInput, { target: { value: "20" } });

      // Wait for the debounced function to be called
      vi.runAllTimers();

      expect(mockProps.onLimitChange).toHaveBeenCalledWith(20);
    }
  });

  it("disables previous button on first page", () => {
    const { container } = render(<Pagination {...mockProps} currentPage={1} isLoading={false} />);

    // Find the previous button
    const nav = container.querySelector("nav");
    const buttons = nav?.querySelectorAll("button");
    const prevButton = buttons?.[0]; // First button is Previous

    expect(prevButton?.disabled).toBe(true);
  });

  it("disables next button on last page", () => {
    const { container } = render(<Pagination {...mockProps} currentPage={5} isLoading={false} />);

    // Find the next button
    const nav = container.querySelector("nav");
    const buttons = nav?.querySelectorAll("button");
    const nextButton = buttons?.[1]; // Second button is Next

    expect(nextButton?.disabled).toBe(true);
  });
});
