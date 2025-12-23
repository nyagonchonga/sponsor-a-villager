
import "dotenv/config";
import express from "express";
import { registerRoutes } from "../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize the app lazily
let appReady = false;

async function setup() {
    if (appReady) return;
    await registerRoutes(app);
    appReady = true;
}

export default async function handler(req: any, res: any) {
    await setup();
    // Forward request to Express app
    app(req, res);
}
