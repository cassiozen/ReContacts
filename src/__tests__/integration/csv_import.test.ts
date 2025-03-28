import { importContacts } from "@/app/contacts/actions";
import { insertCSVQueue } from "@/queue";
import { beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

// Mock Drizzle ORM and database instance
vi.mock("drizzle-orm");
vi.mock("@/db", () => ({
  default: {
    insert: vi.fn(),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    prepare: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue([]),
  },
  contacts: {},
  notifications: {},
}));

// Create mock CSV File with stream method
const mockCSVContent = "firstName,lastName,email\nJohn,Doe,john@example.com\nJane,Smith,jane@example.com";
const mockFile = new File([], "test.csv");
Object.defineProperty(mockFile, "stream", {
  value: () =>
    new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(mockCSVContent));
        controller.close();
      },
    }),
});

describe("CSV Import Integration", () => {
  let dbInsertValuesSpy: MockInstance;
  let formData: FormData;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();
    // Setup database spy that tracks insert().values() calls
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (await import("@/db")) as any;
    dbInsertValuesSpy = vi.fn().mockImplementation(() => ({
      onConflictDoUpdate: vi.fn().mockResolvedValue({ rowCount: 2 }),
    }));

    // Configure the mock chain with our spy
    db.default.insert.mockImplementation(() => ({
      values: dbInsertValuesSpy,
    }));

    // Setup sample form data with mock file and column mappings
    formData = new FormData();
    formData.append("csv", mockFile);
    formData.append("firstName", "firstName");
    formData.append("lastName", "lastName");
    formData.append("email", "email");
  });

  it("should process queue tasks and create database records", async () => {
    // Act
    await importContacts(formData);

    // Wait for queue to finish
    await new Promise((resolve) => {
      insertCSVQueue.on("task_finish", (taskId, result) => {
        resolve(result);
      });
    });

    // Assert
    expect(dbInsertValuesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "CSV_import",
        content: expect.stringContaining("Started processing test.csv"),
      })
    );
    expect(dbInsertValuesSpy).toHaveBeenCalledWith([
      expect.objectContaining({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      }),
    ]);
    expect(dbInsertValuesSpy).toHaveBeenCalledWith([
      expect.objectContaining({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
      }),
    ]);
    expect(dbInsertValuesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "CSV_import",
        content: expect.stringContaining("Finished processing test.csv"),
      })
    );
  });

  it("should handle database insert errors during CSV processing", async () => {
    // Mock a database insert error for contacts only
    dbInsertValuesSpy.mockImplementation((values) => {
      // Check if this is a contacts insert by looking at the structure of the values
      if (Array.isArray(values) && values[0] && "firstName" in values[0]) {
        throw new Error("Database constraint violation");
      }
      // For notification inserts, return the original implementation
      return {
        onConflictDoUpdate: vi.fn().mockResolvedValue({ rowCount: 0 }),
      };
    });

    // Act
    await importContacts(formData);

    // Wait for queue to finish
    await new Promise((resolve) => {
      insertCSVQueue.on("task_finish", (taskId, result) => {
        resolve(result);
      });
    });

    // Verify error notification was created
    expect(dbInsertValuesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "CSV_import",
        content: expect.stringContaining("Errors while processing test.csv"),
      })
    );

    // Verify parser resumed after error and completed the task
    expect(dbInsertValuesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "CSV_import",
        content: expect.stringContaining("Finished processing test.csv"),
      })
    );
  });
});
