import { db } from "../db";
import { sql } from "drizzle-orm";

async function inspectIndexes() {
  try {
    const res = await db.execute(sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'form_fields'
    `);
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

inspectIndexes();
