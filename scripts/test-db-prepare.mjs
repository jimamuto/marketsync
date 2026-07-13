import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const TEST_DATABASE = "marketsync_test";
const testUrl = process.env.DATABASE_URL_TEST ?? "postgresql://postgres:postgres@localhost:5432/marketsync_test";
const parsed = new URL(testUrl);
const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));

if (databaseName !== TEST_DATABASE) {
  throw new Error(`Refusing to prepare non-test database: ${databaseName}`);
}

const adminUrl = new URL(testUrl);
adminUrl.pathname = "/postgres";

const adminClient = new Client({ connectionString: adminUrl.toString() });
await adminClient.connect();
const databaseResult = await adminClient.query(
  "select 1 from pg_database where datname = $1",
  [TEST_DATABASE],
);

if (databaseResult.rowCount === 0) {
  await adminClient.query(`create database ${TEST_DATABASE}`);
}
await adminClient.end();

const client = new Client({ connectionString: testUrl });
await client.connect();
await client.query(
  "create table if not exists test_schema_migrations (filename text primary key, applied_at timestamp not null default current_timestamp)",
);

const migrationsDirectory = fileURLToPath(new URL("../database/migrations/", import.meta.url));
const { readdir } = await import("node:fs/promises");
const files = (await readdir(migrationsDirectory))
  .filter((file) => file.endsWith(".sql"))
  .sort();

for (const file of files) {
  const applied = await client.query(
    "select 1 from test_schema_migrations where filename = $1",
    [file],
  );
  if (applied.rowCount > 0) continue;

  const sql = await readFile(`${migrationsDirectory}${file}`, "utf8");
  await client.query("begin");
  try {
    await client.query(sql);
    await client.query("insert into test_schema_migrations (filename) values ($1)", [basename(file)]);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}

await client.query(
  `truncate table
     admin_audit_logs,
     notifications,
     bookings,
     crop_supplies,
     demand_requests,
     email_verification_tokens,
     password_reset_tokens,
     users
   restart identity cascade`,
);

await client.end();
console.log(`Prepared and reset isolated PostgreSQL database: ${TEST_DATABASE}`);
