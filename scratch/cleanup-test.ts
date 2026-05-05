import { db } from "../db";
import { formFields } from "../db/forms-schema";
import { eq } from "drizzle-orm";

async function cleanup() {
  try {
    await db.delete(formFields).where(eq(formFields.id, "3d8a7287-3c27-4293-88cf-63cc1f3da39b"));
    console.log("Cleaned up test field.");
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

cleanup();
