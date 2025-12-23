
import { createCookieSessionStorage } from "cookie-session"; // Not available? 
// We will use standard fetch with cookie management if possible, or just rely on the fact that we can call server functions directly if we import them? 
// No, better to test the API route.

const BASE_URL = "http://localhost:5000";

async function main() {
    console.log("Starting verification...");

    // 1. Register User
    const timestamp = Date.now();
    const email = `testuser_${timestamp}@example.com`;
    const registerPayload = {
        username: `testuser_${timestamp}`,
        email,
        password: "password123",
        firstName: "Test",
        lastName: "User",
        role: "villager",
        phoneNumber: "0700000000"
    };

    console.log("Registering user...", email);
    const regRes = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerPayload)
    });

    if (!regRes.ok) {
        console.error("Registration failed:", await regRes.text());
        process.exit(1);
    }

    const cookies = regRes.headers.get("set-cookie");
    console.log("User registered. Cookie:", cookies);

    // 2. Register Villager
    const villagerPayload = {
        name: "Test Villager",
        age: 25,
        county: "Kisii County",
        constituency: "Bobasi",
        ward: "Basi Bogetaorio",
        story: "This is a test story about my life and dreams.",
        dream: "To become a successful entrepreneur.",
        profileImageUrl: "https://example.com/image.jpg"
    };

    console.log("Creating villager profile...");
    const createRes = await fetch(`${BASE_URL}/api/villagers`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cookie": cookies || ""
        },
        body: JSON.stringify(villagerPayload)
    });

    if (!createRes.ok) {
        console.error("Create villager failed:", await createRes.text());
        process.exit(1);
    }

    const createdVillager = await createRes.json();
    console.log("Villager created:", createdVillager);

    if (createdVillager.constituency !== "Bobasi" || createdVillager.ward !== "Basi Bogetaorio") {
        console.error("Mismatch in location fields:", createdVillager);
        process.exit(1);
    }

    // 3. Verify Profile Fetch
    console.log("Fetching profile...");
    const profileRes = await fetch(`${BASE_URL}/api/villagers/profile`, {
        headers: { "Cookie": cookies || "" }
    });

    if (!profileRes.ok) {
        console.error("Fetch profile failed:", await profileRes.text());
        process.exit(1);
    }

    const profile = await profileRes.json();
    console.log("Profile fetched:", profile);

    if (profile.constituency === "Bobasi" && profile.ward === "Basi Bogetaorio") {
        console.log("SUCCESS: Location fields verified correctly.");
    } else {
        console.error("FAILURE: Profile data mismatch.");
        process.exit(1);
    }
}

main().catch(console.error);
