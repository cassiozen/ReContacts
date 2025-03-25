import { Logger } from "drizzle-orm";
import * as schema from "./schema";

import { drizzle } from "drizzle-orm/node-postgres";

const logger: Logger = {
  logQuery(query: string, params: unknown[]) {
    console.log(`\x1b[34m${query}\x1b[0m`, params, "\n");
  },
};

const drizzleDB = drizzle({
  connection: process.env.DATABASE_URL!,
  logger,
  schema,
});

export default drizzleDB;
export * from "./schema";
