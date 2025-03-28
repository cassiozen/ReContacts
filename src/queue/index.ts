import db, { contacts, notifications } from "@/db";
import { getErrorMessage } from "@/lib/errorMessage";
import Queue from "better-queue";
// @ts-expect-error: Simple in-memory queue without TS declaration (becase it doesn't expose any API)
import MemoryStore from "better-queue-memory";
import { sql } from "drizzle-orm";
import Papa from "papaparse";

type InsertCSVTask = {
  id: string;
  csv: NodeJS.ReadableStream;
  firstNameColumn: string;
  lastNameColumn: string;
  emailColumn: string;
};

export const insertCSVQueue = new Queue<InsertCSVTask, boolean>(
  async (task: InsertCSVTask, cb) => {
    await db
      .insert(notifications)
      .values({ type: "CSV_import", content: `Started processing ${task.id}` });
    let insertionsCount = 0;

    Papa.parse<Record<PropertyKey, string>>(task.csv, {
      header: true, // Assumes first row contains headers
      skipEmptyLines: true,

      // Process data in chunks as it's parsed
      chunk: async (results, parser) => {
        // Skip eventual empty chunks
        if (results.data.length === 0) return;

        const insertionData = results.data.map((entry) => ({
          firstName: entry[task.firstNameColumn],
          lastName: entry[task.lastNameColumn],
          email: entry[task.emailColumn],
        }));

        // We're being conservative here and completely pausing processing
        // while the database is inserting, which works for out constraints.
        parser.pause();

        try {
          const result = await db
            .insert(contacts)
            .values(insertionData)
            .onConflictDoUpdate({
              target: contacts.email,
              set: {
                firstName: sql`excluded.first_name`,
                lastName: sql`excluded.last_name`,
                updatedAt: sql`NOW()`,
              },
            });
          insertionsCount += result.rowCount ?? 0;
        } catch (error) {
          // Notify user and carry on
          await db
            .insert(notifications)
            .values({
              type: "CSV_import",
              content: `Errors while processing ${task.id}: ${getErrorMessage(error)}`,
            });
        } finally {
          parser.resume();
        }
      },

      complete: async () => {
        await db.insert(notifications).values({
          type: "CSV_import",
          content: `Finished processing ${task.id}: ${insertionsCount} contacts upserted.`,
        });
        cb(undefined, true);
      },

      error: async (error) => {
        console.error(error);
        await db.insert(notifications).values({
          type: "CSV_import",
          content: `Fatal Error - Couldn't finish processing ${task.id}: ${getErrorMessage(error)}`,
        });
        cb(error);
      },
    });
  },
  {
    store: new MemoryStore(),
  },
);
