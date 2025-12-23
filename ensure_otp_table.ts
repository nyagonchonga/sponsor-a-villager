
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Checking for 'otps' table...");
    try {
        const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'otps'
      );
    `);

        if (tableCheck.rows[0].exists) {
            console.log("Table 'otps' already exists.");
        } else {
            console.log("Creating 'otps' table...");
            await db.execute(sql`
        CREATE TABLE IF NOT EXISTS otps (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          identifier TEXT NOT NULL,
          code TEXT NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          verified BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
            console.log("Table 'otps' created successfully.");
        }
    } catch (err) {
        console.error("Error managing 'otps' table:", err);
    }
    process.exit(0);
}

main();
