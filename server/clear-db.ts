import { db } from "./db";
import { villagers, users, sponsorships, messages, progressUpdates, sessions } from "@shared/schema";

async function clearDatabase() {
    console.log("Clearing database tables using Drizzle...");

    try {
        await db.delete(messages);
        console.log("- Cleared messages");
    } catch (e: any) { console.log(`- messages: ${e.message}`); }

    try {
        await db.delete(progressUpdates);
        console.log("- Cleared progress_updates");
    } catch (e: any) { console.log(`- progress_updates: ${e.message}`); }

    try {
        await db.delete(sponsorships);
        console.log("- Cleared sponsorships");
    } catch (e: any) { console.log(`- sponsorships: ${e.message}`); }

    try {
        await db.delete(villagers);
        console.log("- Cleared villagers");
    } catch (e: any) { console.log(`- villagers: ${e.message}`); }

    try {
        await db.delete(users);
        console.log("- Cleared users");
    } catch (e: any) { console.log(`- users: ${e.message}`); }

    try {
        await db.delete(sessions);
        console.log("- Cleared sessions");
    } catch (e: any) { console.log(`- sessions: ${e.message}`); }

    console.log("Database cleanup finished.");
    process.exit(0);
}

clearDatabase().catch(err => {
    console.error("Fatal error clearing database:", err);
    process.exit(1);
});
