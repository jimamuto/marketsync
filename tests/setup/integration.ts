const testUrl = process.env.DATABASE_URL_TEST ?? "postgresql://postgres:postgres@localhost:5432/marketsync_test";
const databaseName = decodeURIComponent(new URL(testUrl).pathname.replace(/^\//, ""));

if (databaseName !== "marketsync_test") {
  throw new Error(`Integration tests require marketsync_test, received ${databaseName}`);
}

process.env.DATABASE_URL = testUrl;
process.env.APP_URL = "http://localhost:3000";
