import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Checking columns in villagers table...");
    const result = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'villagers';
    `);
    console.log("Columns:", JSON.stringify(result, null, 2));
}

main().catch(console.error);
