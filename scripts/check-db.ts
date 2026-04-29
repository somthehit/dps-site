import { db } from "../db/index";
import { teamMembers } from "../db/schema";

async function checkData() {
  const allMembers = await db.select().from(teamMembers);
  console.log("Team Members in DB:");
  allMembers.forEach(m => {
    console.log(`- ${m.nameEn}: [${m.department}]`);
  });
  process.exit(0);
}

checkData();
