
import { db } from "./server/db";
import { migrate } from "drizzle-orm/pglite/migrator";

async function main() {
    console.log("Running migrations...");
    try {
        await migrate(db, { migrationsFolder: "migrations" });
        console.log("Migrations complete!");
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

main();
