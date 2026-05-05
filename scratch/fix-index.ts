import { db } from "../db";
import { sql } from "drizzle-orm";

async function fixIndex() {
  try {
    console.log("Dropping old index...");
    await db.execute(sql`DROP INDEX IF EXISTS field_name_per_form_unique`);
    
    console.log("Creating new partial unique index...");
    await db.execute(sql`
      CREATE UNIQUE INDEX field_name_per_form_unique 
      ON form_fields (form_id, field_name) 
      WHERE deleted_at IS NULL
    `);
    
    console.log("Index fixed successfully!");
  } catch (err) {
    console.error("Failed to fix index:", err);
  }
  process.exit(0);
}

fixIndex();
