import { db } from "../db";
import { formFields } from "../db/forms-schema";

async function testInsert() {
  const formId = "64fe0fd3-4b69-4ed3-958e-82f524d74a04";
  try {
    console.log("Attempting to insert text_3...");
    const [field] = await db.insert(formFields).values({
      formId,
      label: "Test Text 3",
      fieldName: "text_3",
      fieldType: "text",
      sortOrder: 100,
    }).returning();
    console.log("Successfully inserted field:", field.id);
  } catch (err) {
    console.error("Insert failed:", err);
  }
  process.exit(0);
}

testInsert();
