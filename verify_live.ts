
import { db } from "./server/db";
import { otps } from "./shared/schema";
import { eq, desc } from "drizzle-orm";

async function verifyLive() {
    // const baseUrl = "http://localhost:5000";
    const baseUrl = "https://sponsor-a-villager-gl6z.vercel.app";
    const testEmail = `live_test_${Date.now()}@example.com`;

    console.log(`Target: ${baseUrl}`);
    console.log(`Email: ${testEmail}`);

    // 1. Fail Register (Should be blocked if fix is deployed)
    console.log("1. Attempting Register without OTP...");
    try {
        const failRes = await fetch(`${baseUrl}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testEmail,
                password: "password123",
                firstName: "Test",
                lastName: "User",
                role: "sponsor",
                phoneNumber: "0000000000"
            })
        });

        if (failRes.status === 400) {
            console.log("✅ Passed: Blocked (400) - Fix is ACTIVE");
        } else if (failRes.status === 201) {
            console.log("❌ Failed: Registration succeeded (201) - Fix is NOT active yet");
        } else {
            console.log(`info: Got status ${failRes.status}`);
            console.log(await failRes.text());
        }
    } catch (e) {
        console.error("Network error:", e);
    }
}

verifyLive().catch(console.error).finally(() => process.exit(0));
