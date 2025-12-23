import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Checking users table schema...");
    try {
        const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
        console.log("Users table columns:");
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error("Query failed:", err);
    }
    process.exit(0);
}

main();
