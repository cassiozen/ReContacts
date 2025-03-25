import db, * as schema from "@/db";
import { seed, reset } from "drizzle-seed";

async function main() {
  await reset(db, schema);

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
}
main();
