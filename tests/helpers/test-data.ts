import { hashPassword } from "../../src/lib/auth";
import { getDb } from "../../src/lib/database";
import type { QueryResultRow } from "pg";

export type TestRole = "farmer" | "buyer" | "admin";

export type TestUser = {
  id: number;
  name: string;
  email: string;
  role: TestRole;
};

export function uniqueEmail(role: TestRole) {
  return `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
}

export async function createTestUser(options: {
  role: TestRole;
  verified?: boolean;
  accountStatus?: "active" | "suspended";
}) {
  const name = `${options.role} test user`;
  const email = uniqueEmail(options.role);
  const passwordHash = await hashPassword("Password123!");
  const result = await getDb().query<TestUser>(
    `insert into users (name, email, password_hash, role, location, email_verified_at, account_status)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning id, name, email, role`,
    [
      name,
      email,
      passwordHash,
      options.role,
      "Nairobi",
      options.verified === false ? null : new Date(),
      options.accountStatus ?? "active",
    ],
  );

  return { ...result.rows[0], password: "Password123!" };
}

export async function databaseRow<T extends QueryResultRow>(query: string, values: unknown[] = []) {
  const result = await getDb().query<T>(query, values);
  return result.rows[0] ?? null;
}
