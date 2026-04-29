import { db } from "../db/index";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Creating hero_slides table...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "hero_slides" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "image_url" text NOT NULL,
      "blur_data_url" text,
      "title_en" text,
      "title_ne" text,
      "subtitle_en" text,
      "subtitle_ne" text,
      "cta_text_en" text,
      "cta_text_ne" text,
      "cta_link" text,
      "overlay_opacity" integer DEFAULT 50 NOT NULL,
      "text_position" varchar(20) DEFAULT 'left' NOT NULL,
      "duration" integer DEFAULT 5 NOT NULL,
      "start_at" timestamp,
      "end_at" timestamp,
      "is_active" boolean DEFAULT true NOT NULL,
      "sort_order" integer DEFAULT 0 NOT NULL,
      "created_at" timestamp DEFAULT now()
    );
  `);

  console.log("hero_slides table created!");
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
