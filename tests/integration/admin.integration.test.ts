import { describe, expect, it } from "vitest";
import { POST as login } from "../../src/app/api/auth/login/route";
import { PATCH as updateUserStatus } from "../../src/app/api/admin/users/[id]/status/route";
import { PATCH as moderateSupply } from "../../src/app/api/admin/supplies/[id]/moderation/route";
import { POST as createSupply } from "../../src/app/api/supplies/route";
import { createTestUser, databaseRow } from "../helpers/test-data";
import { responseJson, routeContext, testRequest } from "../helpers/test-request";

describe("admin workflows with PostgreSQL", () => {
  it("suspends and reactivates a user with audit and notification records", async () => {
    const admin = await createTestUser({ role: "admin" });
    const farmer = await createTestUser({ role: "farmer" });

    const suspendResponse = await updateUserStatus(
      testRequest(`/api/admin/users/${farmer.id}/status`, {
        method: "PATCH",
        user: admin,
        body: { account_status: "suspended" },
      }),
      routeContext(farmer.id),
    );
    expect(suspendResponse.status).toBe(200);
    expect(
      (await databaseRow<{ account_status: string }>("select account_status from users where id = $1", [farmer.id]))
        ?.account_status,
    ).toBe("suspended");

    const suspendedLogin = await login(
      testRequest("/api/auth/login", {
        method: "POST",
        body: { email: farmer.email, password: farmer.password },
      }),
    );
    expect(suspendedLogin.status).toBe(403);

    const reactivateResponse = await updateUserStatus(
      testRequest(`/api/admin/users/${farmer.id}/status`, {
        method: "PATCH",
        user: admin,
        body: { account_status: "active" },
      }),
      routeContext(farmer.id),
    );
    expect(reactivateResponse.status).toBe(200);

    const audit = await databaseRow<{ count: string }>(
      "select count(*)::text as count from admin_audit_logs where entity_type = 'user' and entity_id = $1",
      [farmer.id],
    );
    const notifications = await databaseRow<{ count: string }>(
      "select count(*)::text as count from notifications where user_id = $1",
      [farmer.id],
    );
    expect(Number(audit?.count)).toBe(2);
    expect(Number(notifications?.count)).toBe(2);
  });

  it("denies non-admin moderation and records moderation decisions", async () => {
    const admin = await createTestUser({ role: "admin" });
    const farmer = await createTestUser({ role: "farmer" });
    const buyer = await createTestUser({ role: "buyer" });
    const supplyResponse = await createSupply(
      testRequest("/api/supplies", {
        method: "POST",
        user: farmer,
        body: {
          crop_name: "Beans",
          quantity: 100,
          unit: "kg",
          planting_date: "2026-07-01",
          expected_harvest_date: "2026-08-01",
          location: "Nairobi",
        },
      }),
    );
    const supply = await responseJson<{ supply: { id: number } }>(supplyResponse);

    expect(
      (
        await moderateSupply(
          testRequest(`/api/admin/supplies/${supply.supply.id}/moderation`, {
            method: "PATCH",
            user: buyer,
            body: { moderation_status: "approved" },
          }),
          routeContext(supply.supply.id),
        )
      ).status,
    ).toBe(403);

    const moderationResponse = await moderateSupply(
      testRequest(`/api/admin/supplies/${supply.supply.id}/moderation`, {
        method: "PATCH",
        user: admin,
        body: { moderation_status: "rejected", moderation_note: "Add a harvest date." },
      }),
      routeContext(supply.supply.id),
    );
    expect(moderationResponse.status).toBe(200);

    const stored = await databaseRow<{ moderation_status: string; moderation_note: string }>(
      "select moderation_status, moderation_note from crop_supplies where id = $1",
      [supply.supply.id],
    );
    expect(stored).toEqual({
      moderation_status: "rejected",
      moderation_note: "Add a harvest date.",
    });
  });
});
