import "dotenv/config";
import express from "express";
import { setupAuth } from "../server/auth";
import path from "path";
import fs from "fs";
import multer from "multer";
import { storage } from "../server/storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let initialized = false;

async function initialize() {
    if (initialized) return;

    try {
        // Setup authentication
        setupAuth(app);

        // Setup multer for file uploads
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const multerStorage = multer.diskStorage({
            destination: (_req, _file, cb) => {
                cb(null, uploadDir);
            },
            filename: (_req, file, cb) => {
                const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
            },
        });

        const upload = multer({
            storage: multerStorage,
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        });

        // Upload route
        app.post("/api/upload", upload.single("file"), (req, res) => {
            if (!req.isAuthenticated()) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            const filePath = `/uploads/${req.file.filename}`;
            res.json({ url: filePath });
        });

        // Import and setup all other routes dynamically
        const routes = await import("../server/routes");
        // Call registerRoutes but ignore the server it returns
        await routes.registerRoutes(app);

        initialized = true;
    } catch (error) {
        console.error("Initialization error:", error);
        throw error;
    }
}

export default async function handler(req: any, res: any) {
    try {
        await initialize();
        // Pass the request to the Express app
        app(req, res);
    } catch (error) {
        console.error("Serverless handler error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error)
        });
    }
}
