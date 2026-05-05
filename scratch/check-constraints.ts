import { db } from "../db";
import { sql } from "drizzle-orm";

async function checkConstraints() {
  try {
    const res = await db.execute(sql`
      SELECT conname, contype, pg_get_constraintdef(oid)
      FROM pg_constraint
      WHERE conrelid = 'form_fields'::regclass
    `);
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

checkConstraints();
