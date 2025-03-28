import { Logger } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";
import * as schema from "./schema";

import { drizzle } from "drizzle-orm/node-postgres";

const truncate = (str: string) =>
  str.length <= 1000 ? str : str.slice(0, 999) + "…";

const logger: Logger = {
  logQuery(query: string, params: unknown[]) {
    const stringParams =
      params.length > 0 ? `[${truncate(params.join(", "))}]` : "";
    console.log(" QUERY", `\x1b[34m${truncate(query)}\x1b[0m`, stringParams);
  },
};

const drizzleDB = drizzle({
  connection: process.env.DATABASE_URL!,
  logger,
  schema,
});

// Automatically run migrations on start
migrate(drizzleDB, {
  migrationsFolder: path.join(process.cwd(), "migrations"),
});

export default drizzleDB;
export * from "./schema";
