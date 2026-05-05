import { db } from "../db";
import { formFields } from "../db/forms-schema";

async function checkNames() {
  try {
    const res = await db.select({ 
      fieldName: formFields.fieldName, 
      deletedAt: formFields.deletedAt 
    }).from(formFields);
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

checkNames();
