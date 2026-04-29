import { db } from "../db/index";
import { teamMembers } from "../db/schema";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Starting normalization...");

  // 1. Lowercase all departments
  await db.update(teamMembers).set({
    department: sql`LOWER(department)`
  });

  // 2. Map legacy names to new IDs if needed
  // (e.g. if any are 'technology' but should be something else, but user JSON used 'Technology' etc)

  console.log("Normalization complete!");
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
