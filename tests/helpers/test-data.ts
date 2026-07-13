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

const testPassword = "Password123!";
const testPasswordHash = hashPassword(testPassword);

export function uniqueEmail(role: TestRole) {
  return `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
}

export async function createTestUser<Role extends TestRole>(options: {
  role: Role;
  verified?: boolean;
  accountStatus?: "active" | "suspended";
}) {
  const name = `${options.role} test user`;
  const email = uniqueEmail(options.role);
  const passwordHash = await testPasswordHash;
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

  return { ...result.rows[0], role: options.role, password: testPassword };
}

export async function createSupplyRecord(
  farmerId: number,
  overrides: Partial<{
    cropName: string;
    quantity: number;
    unit: string;
    location: string;
    status: string;
    moderationStatus: string;
  }> = {},
) {
  const result = await getDb().query<{ id: number }>(
    `insert into crop_supplies
       (farmer_id, crop_name, quantity, unit, planting_date, expected_harvest_date,
        location, status, moderation_status)
     values ($1, $2, $3, $4, '2026-07-01', '2026-08-01', $5, $6, $7)
     returning id`,
    [
      farmerId,
      overrides.cropName ?? "Tomatoes",
      overrides.quantity ?? 500,
      overrides.unit ?? "kg",
      overrides.location ?? "Nairobi",
      overrides.status ?? "ready",
      overrides.moderationStatus ?? "approved",
    ],
  );
  return result.rows[0];
}

export async function createDemandRecord(
  buyerId: number,
  overrides: Partial<{
    cropName: string;
    quantity: number;
    unit: string;
    location: string;
    status: string;
    moderationStatus: string;
  }> = {},
) {
  const result = await getDb().query<{ id: number }>(
    `insert into demand_requests
       (buyer_id, crop_name, quantity, unit, required_date, location, status, moderation_status)
     values ($1, $2, $3, $4, '2026-08-05', $5, $6, $7)
     returning id`,
    [
      buyerId,
      overrides.cropName ?? "Tomatoes",
      overrides.quantity ?? 200,
      overrides.unit ?? "kg",
      overrides.location ?? "Nairobi",
      overrides.status ?? "open",
      overrides.moderationStatus ?? "approved",
    ],
  );
  return result.rows[0];
}

export async function createBookingRecord(options: {
  supplyId: number;
  demandId: number;
  buyerId: number;
  farmerId: number;
  status?: string;
}) {
  const result = await getDb().query<{ id: number }>(
    `insert into bookings
       (supply_id, demand_request_id, buyer_id, farmer_id, quantity, unit, status)
     values ($1, $2, $3, $4, 100, 'kg', $5)
     returning id`,
    [options.supplyId, options.demandId, options.buyerId, options.farmerId, options.status ?? "pending"],
  );
  return result.rows[0];
}

export async function databaseRow<T extends QueryResultRow>(query: string, values: unknown[] = []) {
  const result = await getDb().query<T>(query, values);
  return result.rows[0] ?? null;
}
