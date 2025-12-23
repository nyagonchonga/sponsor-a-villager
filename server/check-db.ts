import { db } from "./db";
import { villagers } from "@shared/schema";

async function checkVillagers() {
    const allVillagers = await db.select().from(villagers);
    console.log(`Found ${allVillagers.length} villagers:`);
    allVillagers.forEach(v => console.log(`- ${v.name} (${v.id})`));
    process.exit(0);
}

checkVillagers().catch(err => {
    console.error(err);
    process.exit(1);
});
