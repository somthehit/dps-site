import { db } from "../db/index";
import { teamMembers } from "../db/schema";
import { eq } from "drizzle-orm";

async function fixDepartments() {
  console.log("Normalizing team departments to lowercase...");
  
  const members = await db.select().from(teamMembers);
  
  for (const member of members) {
    if (member.department) {
      const normalized = member.department.toLowerCase();
      if (normalized !== member.department) {
        console.log(`Updating ${member.nameEn}: ${member.department} -> ${normalized}`);
        await db.update(teamMembers)
          .set({ department: normalized })
          .where(eq(teamMembers.id, member.id));
      }
    }
  }
  
  console.log("Done!");
  process.exit(0);
}

fixDepartments().catch(console.error);
