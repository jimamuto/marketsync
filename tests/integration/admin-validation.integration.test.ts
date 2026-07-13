import { describe, expect, it } from "vitest";
import { PATCH as updateUserStatus } from "../../src/app/api/admin/users/[id]/status/route";
import { PATCH as moderateSupply } from "../../src/app/api/admin/supplies/[id]/moderation/route";
import { PATCH as moderateDemand } from "../../src/app/api/admin/demands/[id]/moderation/route";
import {
  createDemandRecord,
  createSupplyRecord,
  createTestUser,
  databaseRow,
} from "../helpers/test-data";
import { routeContext, testRequest } from "../helpers/test-request";

describe("admin validation and safeguards", () => {
  it("prevents an administrator from suspending their own account", async () => {
    const admin = await createTestUser({ role: "admin" });
    const response = await updateUserStatus(
      testRequest(`/api/admin/users/${admin.id}/status`, {
        method: "PATCH",
        user: admin,
        body: { account_status: "suspended" },
      }),
      routeContext(admin.id),
    );
    expect(response.status).toBe(400);
  });

  it("prevents administrators from suspending other administrator accounts", async () => {
    const admin = await createTestUser({ role: "admin" });
    const otherAdmin = await createTestUser({ role: "admin" });
    const response = await updateUserStatus(
      testRequest(`/api/admin/users/${otherAdmin.id}/status`, {
        method: "PATCH",
        user: admin,
        body: { account_status: "suspended" },
      }),
      routeContext(otherAdmin.id),
    );
    expect(response.status).toBe(400);
  });

  it("rejects invalid account statuses, identifiers, and missing users", async () => {
    const admin = await createTestUser({ role: "admin" });
    const farmer = await createTestUser({ role: "farmer" });

    const invalidStatus = await updateUserStatus(
      testRequest(`/api/admin/users/${farmer.id}/status`, {
        method: "PATCH",
        user: admin,
        body: { account_status: "blocked" },
      }),
      routeContext(farmer.id),
    );
    const invalidId = await updateUserStatus(
      testRequest("/api/admin/users/nope/status", {
        method: "PATCH",
        user: admin,
        body: { account_status: "active" },
      }),
      { params: Promise.resolve({ id: "nope" }) },
    );
    const missing = await updateUserStatus(
      testRequest("/api/admin/users/999999/status", {
        method: "PATCH",
        user: admin,
        body: { account_status: "active" },
      }),
      routeContext(999999),
    );

    expect(invalidStatus.status).toBe(400);
    expect(invalidId.status).toBe(400);
    expect(missing.status).toBe(404);
  });

  it("rejects invalid supply moderation decisions and missing supplies", async () => {
    const admin = await createTestUser({ role: "admin" });
    const farmer = await createTestUser({ role: "farmer" });
    const supply = await createSupplyRecord(farmer.id, { moderationStatus: "pending" });

    const invalidStatus = await moderateSupply(
      testRequest(`/api/admin/supplies/${supply.id}/moderation`, {
        method: "PATCH",
        user: admin,
        body: { moderation_status: "hidden" },
      }),
      routeContext(supply.id),
    );
    const missing = await moderateSupply(
      testRequest("/api/admin/supplies/999999/moderation", {
        method: "PATCH",
        user: admin,
        body: { moderation_status: "approved" },
      }),
      routeContext(999999),
    );

    expect(invalidStatus.status).toBe(400);
    expect(missing.status).toBe(404);
  });

  it("rejects invalid demand moderation decisions and missing demands", async () => {
    const admin = await createTestUser({ role: "admin" });
    const buyer = await createTestUser({ role: "buyer" });
    const demand = await createDemandRecord(buyer.id, { moderationStatus: "pending" });

    const invalidStatus = await moderateDemand(
      testRequest(`/api/admin/demands/${demand.id}/moderation`, {
        method: "PATCH",
        user: admin,
        body: { moderation_status: "hidden" },
      }),
      routeContext(demand.id),
    );
    const missing = await moderateDemand(
      testRequest("/api/admin/demands/999999/moderation", {
        method: "PATCH",
        user: admin,
        body: { moderation_status: "approved" },
      }),
      routeContext(999999),
    );

    expect(invalidStatus.status).toBe(400);
    expect(missing.status).toBe(404);
  });

  it("stores demand reviewer details, audit metadata, and notification content", async () => {
    const admin = await createTestUser({ role: "admin" });
    const buyer = await createTestUser({ role: "buyer" });
    const demand = await createDemandRecord(buyer.id, { moderationStatus: "pending" });

    const response = await moderateDemand(
      testRequest(`/api/admin/demands/${demand.id}/moderation`, {
        method: "PATCH",
        user: admin,
        body: { moderation_status: "rejected", moderation_note: "Clarify delivery requirements." },
      }),
      routeContext(demand.id),
    );
    expect(response.status).toBe(200);

    const storedDemand = await databaseRow<{
      moderation_status: string;
      moderation_note: string;
      reviewed_by: number;
      reviewed_at: Date;
    }>(
      "select moderation_status, moderation_note, reviewed_by, reviewed_at from demand_requests where id = $1",
      [demand.id],
    );
    expect(storedDemand).toMatchObject({
      moderation_status: "rejected",
      moderation_note: "Clarify delivery requirements.",
      reviewed_by: admin.id,
    });
    expect(storedDemand?.reviewed_at).toBeInstanceOf(Date);

    const audit = await databaseRow<{ action: string; details: { note: string } }>(
      "select action, details from admin_audit_logs where entity_type = 'demand' and entity_id = $1",
      [demand.id],
    );
    const notification = await databaseRow<{ title: string; message: string; type: string }>(
      "select title, message, type from notifications where user_id = $1",
      [buyer.id],
    );
    expect(audit?.action).toBe("demand_rejected");
    expect(audit?.details.note).toBe("Clarify delivery requirements.");
    expect(notification).toMatchObject({
      title: "Demand request review updated",
      type: "demand_moderation_updated",
    });
    expect(notification?.message).toContain("rejected");
  });
});
