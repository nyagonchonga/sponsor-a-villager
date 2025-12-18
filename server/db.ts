import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import ws from "ws";
import * as schema from "@shared/schema";
import path from "path";
import fs from "fs";

neonConfig.webSocketConstructor = ws;

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), ".gemini", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

export const db = process.env.DATABASE_URL
  ? drizzle({ client: pool!, schema })
  : drizzlePglite(new PGlite(path.join(dataDir, "db")), { schema });

// Helper to check if we're using PGlite
export const isPgLite = !process.env.DATABASE_URL;