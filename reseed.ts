import { db } from "./server/db";
import { villagers } from "@shared/schema";
import { sql } from "drizzle-orm";

async function clearAndReseed() {
    console.log("Clearing existing data...");
    try {
        await db.delete(villagers);
        console.log("Cleared villagers table");
    } catch (err) {
        console.log("Table may be empty or error deleting:", err);
    }

    console.log("\nSeeding database...");

    const sampleVillagers = [
        {
            name: "John Kamau",
            age: 22,
            location: "Limuru, Kiambu County",
            story: "Growing up in a farming community, I've always been hardworking. I moved to Nairobi seeking better opportunities to support my elderly parents. The Boda Boda program is my chance to gain independence through clean energy mobility.",
            dream: "I dream of owning a fleet of electric bikes and training other youth from my village.",
            profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
            targetAmount: "65000.00",
            currentAmount: "15000.00",
            status: "partially_funded" as const,
            trainingProgress: 25,
        },
        {
            name: "Sharon Otieno",
            age: 24,
            location: "Homa Bay, Nyanza County",
            story: "As a young woman, finding stable work has been difficult. I want to prove that women can excel in the logistics and transport sector. This program offers me the training and tools I need to start my own delivery business.",
            dream: "My dream is to become a top-rated female rider and inspire more girls to join the green revolution.",
            profileImageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
            targetAmount: "65000.00",
            currentAmount: "65000.00",
            status: "fully_funded" as const,
            trainingProgress: 100,
        },
        {
            name: "Samuel Mwangi",
            age: 19,
            location: "Nyeri, Central County",
            story: "I recently finished secondary school and couldn't afford college. I've been helping my father on the farm, but I want to build a career in the city. The electric bike program is a perfect fit for my mechanical interests.",
            dream: "I want to save enough money to go back to school part-time and study engineering.",
            profileImageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
            targetAmount: "65000.00",
            currentAmount: "5000.00",
            status: "available" as const,
            trainingProgress: 0,
        },
        {
            name: "Grace Wanyonyi",
            age: 21,
            location: "Bungoma, Western County",
            story: "I've always been passionate about environmental conservation. Joining a program that uses electric bikes aligns with my values while giving me a way to earn a decent living and support my siblings' education.",
            dream: "I dream of seeing Nairobi lead the world in electric mobility, and I want to be part of that history.",
            profileImageUrl: "https://images.unsplash.com/photo-1523824921871-d6f1a45151b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
            targetAmount: "65000.00",
            currentAmount: "0.00",
            status: "available" as const,
            trainingProgress: 0,
        }
    ];

    for (const villager of sampleVillagers) {
        try {
            const result = await db.insert(villagers).values(villager).returning();
            console.log(`✓ Added villager: ${villager.name}`);
        } catch (err) {
            console.error(`✗ Error adding villager ${villager.name}:`, err);
        }
    }

    console.log("\nVerifying data...");
    try {
        const count = await db.select({ count: sql`count(*)` }).from(villagers);
        console.log(`Total villagers in database: ${JSON.stringify(count)}`);
    } catch (err) {
        console.error("Error counting villagers:", err);
    }

    console.log("\nDone!");
}

clearAndReseed().catch((err) => {
    console.error("Reseed failed:", err);
    process.exit(1);
});
