
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Fixing database...");
    try {
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS sponsorship_bundle varchar;`);
        console.log("Added sponsorship_bundle.");

        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS sponsorship_amount decimal(10, 2);`);
        console.log("Added sponsorship_amount.");

        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_payment_method varchar;`);
        console.log("Added preferred_payment_method.");
    } catch (err) {
        console.error("Fix failed:", err);
    }
    process.exit(0);
}

main();
