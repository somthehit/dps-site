import { db } from "../db";
import { sql } from "drizzle-orm";

async function updateSchema() {
  console.log("Updating members table schema...");
  
  try {
    await db.execute(sql`
      -- Make member_code nullable
      ALTER TABLE "members" ALTER COLUMN "member_code" DROP NOT NULL;
      
      -- Make join_date nullable
      ALTER TABLE "members" ALTER COLUMN "join_date" DROP NOT NULL;
      
      -- Change default status to pending
      ALTER TABLE "members" ALTER COLUMN "status" SET DEFAULT 'pending';
      
      -- Add approval fields
      ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "approval_date" timestamp;
      ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "approved_by" uuid REFERENCES "system_users"("id");
      ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "rejection_reason" text;
    `);
    console.log("Schema updated successfully!");
  } catch (err) {
    console.error("Error updating schema:", err);
  }
}

updateSchema().catch(console.error);
