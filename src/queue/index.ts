import Queue from "better-queue";
import MemoryStore from "better-queue-memory";
import Papa from "papaparse";
import db, { contacts } from "@/db";

type InsertCSVTask = {
  csv: NodeJS.ReadableStream;
  firstNameColumn: string;
  lastNameColumn: string;
  emailColumn: string;
};

export const insertCSVQueue = new Queue<InsertCSVTask, boolean>(
  async (task: InsertCSVTask, cb) => {
    Papa.parse<Record<PropertyKey, string>>(task.csv, {
      header: true, // Assumes first row contains headers
      skipEmptyLines: true,

      // Process data in chunks as it's parsed
      chunk: async (results, parser) => {
        console.log(`Processing chunk with ${results.data.length} rows`);
        const insertionData = results.data.map((entry) => ({
          firstName: entry[task.firstNameColumn],
          lastName: entry[task.lastNameColumn],
          email: entry[task.emailColumn],
        }));
        parser.pause();

        try {
          await db.insert(contacts).values(insertionData).onConflictDoNothing();
        } catch (error) {
          console.log(error);
        } finally {
          setTimeout(() => parser.resume(), 1000);
        }
      },

      complete: () => {
        console.log(`Parsing complete.`);
        cb(undefined, true);
      },

      error: (error) => {
        cb(error);
      },
    });
  },
  {
    store: new MemoryStore(),
  }
);
