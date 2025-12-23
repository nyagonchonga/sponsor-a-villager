import { PGlite } from "@electric-sql/pglite";
import path from "path";

async function investigate() {
    const dataDir = path.join(process.cwd(), ".gemini", "data", "db");
    const pg = new PGlite(dataDir);

    console.log("Listing all tables in the database:");
    const res = await pg.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
    console.log(JSON.stringify(res.rows, null, 2));

    for (const row of res.rows as any[]) {
        const table = row.tablename;
        try {
            const countRes = await pg.query(`SELECT COUNT(*) FROM "${table}"`);
            console.log(`Table "${table}" has ${(countRes.rows[0] as any).count} rows.`);
        } catch (e: any) {
            console.error(`Error counting Table "${table}":`, e.message);
        }
    }
}

investigate().catch(console.error);
