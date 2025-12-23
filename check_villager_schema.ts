
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Checking villagers table schema...");
    try {
        const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'villagers'
      ORDER BY ordinal_position;
    `);
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error("Query failed:", err);
    }
    process.exit(0);
}

main();
