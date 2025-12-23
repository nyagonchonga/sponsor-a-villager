
import { db } from "./server/db";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function main() {
    console.log("Running migration 0005...");
    try {
        const migrationSql = fs.readFileSync(path.join(process.cwd(), "migrations", "0005_add_license_and_programs.sql"), "utf-8");
        await db.execute(sql.raw(migrationSql));
        console.log("Executed 0005_add_license_and_programs.sql");
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

main();
