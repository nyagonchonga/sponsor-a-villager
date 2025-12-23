
import { db } from "./server/db";
import { users, villagers } from "./shared/schema";
import { eq } from "drizzle-orm";

// Instead, I'll direct DB insert to test

async function main() {
    console.log("Verifying Villager Registration with License...");

    try {
        // 1. Create a User first
        const testEmail = `test_lic_${Date.now()}@example.com`;
        const [user] = await db.insert(users).values({
            email: testEmail,
            password: "hashed_password",
            role: "villager",
            firstName: "Lic",
            lastName: "Test",
            username: `lic_user_${Date.now()}`,
            phoneNumber: "0700000000"
        }).returning();

        console.log("Created User:", user.id);

        // 2. Insert Villager with License and Program Type
        const [villager] = await db.insert(villagers).values({
            userId: user.id,
            name: "License Test Villager",
            age: 25,
            county: "Kisii County",
            constituency: "Bobasi",
            ward: "Basi Bogetaorio",
            story: "I have a license and want to drive.",
            dream: "Drive in Nairobi",
            // hasLicense field removed as it's not in DB
            // Wait, hasLicense is NOT in schema, it's a form field. Schema has licenseType.
            licenseType: "A",
            licenseImageUrl: "http://example.com/lic.jpg",
            programType: "nairobi_driver",
            targetAmount: "65000.00"
        }).returning();

        console.log("Created Villager:", villager);

        // 3. Insert Villager with Bike Loan Deposit
        const testEmail2 = `test_loan_${Date.now()}@example.com`;
        const [user2] = await db.insert(users).values({
            email: testEmail2,
            password: "hashed_password",
            role: "villager",
            firstName: "Loan",
            lastName: "Test",
            username: `loan_user_${Date.now()}`,
            phoneNumber: "0700000001"
        }).returning();

        const [villager2] = await db.insert(villagers).values({
            userId: user2.id,
            name: "Loan Test Villager",
            age: 22,
            county: "Kisii County",
            constituency: "Bobasi",
            ward: "Basi Bogetaorio",
            story: "I need a deposit.",
            dream: "Own a bike",
            licenseType: "none",
            programType: "bike_deposit",
            targetAmount: "20000.00" // Should be set by logic, but manual insert sets it directly
        }).returning();

        console.log("Created Villager (Loan):", villager2);

        console.log("Verification Successful: Schema accepts new fields.");

    } catch (err) {
        console.error("Verification Failed:", err);
        const fs = require('fs');
        fs.writeFileSync('verify_error.txt', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        process.exit(1);
    }
    process.exit(0);
}

main();
