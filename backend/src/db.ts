import { Pool, PoolClient } from "pg";
import * as fs from "fs";
import * as path from "path";
import { config } from "./config";

export const pool = new Pool({ connectionString: config.databaseUrl });

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export async function runMigrations(): Promise<void> {
  const migrationsDir = path.join(__dirname, "..", "migrations");
  const files = fs.readdirSync(migrationsDir).sort();
  const client: PoolClient = await pool.connect();
  try {
    for (const file of files) {
      if (file.endsWith(".sql")) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
        await client.query(sql);
        console.log(`Migration ${file} applied`);
      }
    }
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log("Migrations complete");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
