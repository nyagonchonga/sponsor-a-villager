import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function clearVillagers() {
    console.log("Clearing villagers from database...");

    try {
        await db.execute(sql`DELETE FROM villagers`);
        console.log("✓ All villagers cleared");

        // Verify
        const result = await db.execute(sql`SELECT COUNT(*) as count FROM villagers`);
        console.log(`Total villagers remaining: ${JSON.stringify(result.rows)}`);
    } catch (err) {
        console.error("Error:", err);
        throw err;
    }
}

clearVillagers().catch(console.error);
