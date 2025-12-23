import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function seedWithSQL() {
    console.log("Seeding with raw SQL...\n");

    const villagerData = [
        ["John Kamau", 22, "Limuru, Kiambu County", "Growing up in a farming community, I've always been hardworking. I moved to Nairobi seeking better opportunities to support my elderly parents.", "I dream of owning a fleet of electric bikes.", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", "65000.00", "15000.00", "partially_funded", 25],
        ["Sharon Otieno", 24, "Homa Bay, Nyanza County", "As a young woman, finding stable work has been difficult. I want to prove that women can excel in the logistics sector.", "My dream is to become a top-rated female rider.", "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", "65000.00", "65000.00", "fully_funded", 100],
        ["Samuel Mwangi", 19, "Nyeri, Central County", "I recently finished secondary school and couldn't afford college. The electric bike program is perfect for my mechanical interests.", "I want to save enough to study engineering.", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", "65000.00", "5000.00", "available", 0],
        ["Grace Wanyonyi", 21, "Bungoma, Western County", "I've always been passionate about environmental conservation. This aligns with my values while giving me a livelihood.", "I dream of seeing Nairobi lead in electric mobility.", "https://images.unsplash.com/photo-1523824921871-d6f1a45151b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", "65000.00", "0.00", "available", 0],
    ];

    try {
        // Clear existing data
        await db.execute(sql`DELETE FROM villagers`);
        console.log("✓ Cleared existing data");

        // Insert each villager
        for (const [name, age, location, story, dream, profileImageUrl, targetAmount, currentAmount, status, trainingProgress] of villagerData) {
            await db.execute(sql`
        INSERT INTO villagers (name, age, location, story, dream, profile_image_url, target_amount, current_amount, status, training_progress)
        VALUES (${name}, ${age}, ${location}, ${story}, ${dream}, ${profileImageUrl}, ${targetAmount}, ${currentAmount}, ${status}, ${trainingProgress})
      `);
            console.log(`✓ Added: ${name}`);
        }

        // Verify count
        const result = await db.execute(sql`SELECT COUNT(*) as count FROM villagers`);
        console.log(`\nTotal villagers: ${JSON.stringify(result.rows)}`);

        // Show all villagers
        const villagers = await db.execute(sql`SELECT name, status, current_amount, target_amount FROM villagers`);
        console.log("\nVillagers in database:");
        villagers.rows.forEach((v: any) => {
            console.log(`  - ${v.name} (${v.status}) - KSh ${v.current_amount}/${v.target_amount}`);
        });

        console.log("\n✓ Seeding complete!");
    } catch (err) {
        console.error("Error:", err);
        throw err;
    }
}

seedWithSQL().catch(console.error);
