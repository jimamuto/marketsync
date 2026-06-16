import { Pool } from "pg";

let pool: Pool | undefined;

export function getDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required.");
  }

  pool ??= new Pool({ connectionString });

  return pool;
}
