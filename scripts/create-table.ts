import { db } from "@/db";
import { sql } from "drizzle-orm";

async function createTable() {
  console.log("Creating news_ticker table...");
  
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "news_ticker" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "content_en" text NOT NULL,
      "content_ne" text NOT NULL,
      "is_active" boolean NOT NULL DEFAULT true,
      "sort_order" integer NOT NULL DEFAULT 0,
      "created_at" timestamp DEFAULT now()
    );
  `);

  console.log("Table created!");
}

createTable().catch(console.error);
