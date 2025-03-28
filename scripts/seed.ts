import db, * as schema from "@/db";
import { sql } from "drizzle-orm";
import { seed, reset } from "drizzle-seed";

async function main() {
  await reset(db, schema);

  console.warn("\n⚠️ Seeding, hang on...\n");

  await seed(db, { contacts: schema.contacts }).refine((f) => ({
    contacts: {
      columns: {
        email: f.email(),
        firstName: f.firstName(),
        lastName: f.lastName(),
      },
      count: 1000,
    },
  }));

  // Reset the sequence to the max ID to avoid duplicate key issues
  // Bug report: https://github.com/drizzle-team/drizzle-orm/issues/3915
  await db.execute(
    sql`SELECT setval(pg_get_serial_sequence('contacts', 'id'), coalesce(max(id), 0) + 1, false) FROM contacts`
  );
}
main();
