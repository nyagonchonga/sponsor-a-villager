
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Fixing villagers schema...");
    try {
        await db.execute(sql`ALTER TABLE villagers ADD COLUMN IF NOT EXISTS license_type varchar NOT NULL DEFAULT 'none';`);
        console.log("Added license_type");

        await db.execute(sql`ALTER TABLE villagers ADD COLUMN IF NOT EXISTS license_image_url varchar;`);
        console.log("Added license_image_url");

        await db.execute(sql`ALTER TABLE villagers ADD COLUMN IF NOT EXISTS program_type varchar NOT NULL DEFAULT 'standard';`);
        console.log("Added program_type");
    } catch (err) {
        console.error("Fix failed:", err);
    }
    process.exit(0);
}

main();
