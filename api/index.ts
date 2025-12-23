import "dotenv/config";
import express from "express";
import { registerRoutes } from "../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let initialized = false;

async function initialize() {
    if (initialized) return;
    // registerRoutes sets up auth and all routes, returns a server we don't need
    await registerRoutes(app);
    initialized = true;
}

export default async function handler(req: any, res: any) {
    try {
        await initialize();
        // Pass the request to the Express app
        app(req, res);
    } catch (error) {
        console.error("Serverless handler error:", error);
        res.status(500).json({ message: "Internal server error", error: String(error) });
    }
}
