import { db } from "../db";
import { sql } from "drizzle-orm";

async function checkDuplicates() {
  try {
    const res = await db.execute(sql`
      SELECT id, field_name, deleted_at 
      FROM form_fields 
      WHERE form_id = '64fe0fd3-4b69-4ed3-958e-82f524d74a04' 
      AND field_name = 'text_3'
    `);
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

checkDuplicates();
