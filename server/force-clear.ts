import { db } from "./db";
import { villagers, users, sponsorships, messages, progressUpdates, sessions } from "@shared/schema";

async function forceClear() {
    console.log("Force clearing all data...");

    try {
        // Delete in order of dependencies
        await db.delete(messages);
        await db.delete(progressUpdates);
        await db.delete(sponsorships);
        await db.delete(villagers);
        await db.delete(users);
        await db.delete(sessions);

        console.log("✅ All tables cleared.");
    } catch (err: any) {
        console.error("❌ Error during clear:", err.message);
    }
    process.exit(0);
}

forceClear().catch(console.error);
