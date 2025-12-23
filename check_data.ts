import { db } from "./server/db";
import { villagers } from "@shared/schema";

async function checkData() {
  console.log("Checking villagers data...");
  try {
    const data = await db.select().from(villagers);
    console.log(`Found ${data.length} villagers:`);
    data.forEach(v => {
      console.log(`- ${v.name} (${v.status}) - KSh ${v.currentAmount}/${v.targetAmount}`);
    });
  } catch (err) {
    console.error("Error fetching villagers:", err);
  }
}

checkData().catch(console.error);
