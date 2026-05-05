import { db } from "../db";
import { formFields } from "../db/forms-schema";
import { eq, and, isNull } from "drizzle-orm";

async function checkActiveNames() {
  const formId = "64fe0fd3-4b69-4ed3-958e-82f524d74a04";
  try {
    const res = await db.select({ 
      id: formFields.id,
      fieldName: formFields.fieldName, 
      deletedAt: formFields.deletedAt 
    }).from(formFields)
    .where(eq(formFields.formId, formId));
    
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

checkActiveNames();
