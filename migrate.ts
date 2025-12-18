
import { migrate } from "drizzle-orm/pglite/migrator";
import { db } from "./server/db";

async function main() {
    console.log("Migrating database...");
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("Migration complete!");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
