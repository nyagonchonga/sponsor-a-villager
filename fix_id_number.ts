import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Fixing id_number constraint...");
    try {
        await db.execute(sql`ALTER TABLE users ALTER COLUMN id_number DROP NOT NULL;`);
        console.log("Successfully made id_number nullable.");
    } catch (err) {
        console.error("Fix failed:", err);
    }
    process.exit(0);
}

main();
