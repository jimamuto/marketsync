import { beforeEach, describe, expect, it } from "vitest";
import { POST as createBooking } from "../../src/app/api/bookings/route";
import { PATCH as updateBooking } from "../../src/app/api/bookings/[id]/status/route";
import { POST as createSupply } from "../../src/app/api/supplies/route";
import { POST as createDemand } from "../../src/app/api/demands/route";
import { GET as getMatches } from "../../src/app/api/demands/[id]/matches/route";
import { PATCH as moderateSupply } from "../../src/app/api/admin/supplies/[id]/moderation/route";
import { PATCH as moderateDemand } from "../../src/app/api/admin/demands/[id]/moderation/route";
import { resetTestDatabase } from "../setup/integration";
import { createTestUser, databaseRow } from "../helpers/test-data";
import { responseJson, routeContext, testRequest } from "../helpers/test-request";

describe("moderated marketplace workflow with PostgreSQL", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  async function createPendingRecords() {
    const farmer = await createTestUser({ role: "farmer" });
    const buyer = await createTestUser({ role: "buyer" });
    const admin = await createTestUser({ role: "admin" });

    const supplyResponse = await createSupply(
      testRequest("/api/supplies", {
        method: "POST",
        user: farmer,
        body: {
          crop_name: "Tomatoes",
          crop_variety: "Roma",
          quantity: 500,
          unit: "kg",
          planting_date: "2026-07-01",
          expected_harvest_date: "2026-08-01",
          location: "Nairobi",
          status: "ready",
        },
      }),
    );
    const demandResponse = await createDemand(
      testRequest("/api/demands", {
        method: "POST",
        user: buyer,
        body: {
          crop_name: "Tomatoes",
          quantity: 200,
          unit: "kg",
          required_date: "2026-08-05",
          location: "Nairobi",
          status: "open",
        },
      }),
    );

    const supply = await responseJson<{ supply: { id: number } }>(supplyResponse);
    const demand = await responseJson<{ demand: { id: number } }>(demandResponse);
    return { farmer, buyer, admin, supply: supply.supply, demand: demand.demand };
  }

  it("keeps pending records out of matching and booking", async () => {
    const { buyer, supply, demand } = await createPendingRecords();

    const matchesResponse = await getMatches(
      testRequest(`/api/demands/${demand.id}/matches`, { user: buyer }),
      routeContext(demand.id),
    );
    expect(matchesResponse.status).toBe(200);
    expect((await responseJson<{ matches: unknown[] }>(matchesResponse)).matches).toHaveLength(0);

    const bookingResponse = await createBooking(
      testRequest("/api/bookings", {
        method: "POST",
        user: buyer,
        body: {
          supplyId: supply.id,
          demandRequestId: demand.id,
          quantity: 100,
          unit: "kg",
        },
      }),
    );
    expect(bookingResponse.status).toBe(409);
  });

  it("matches approved records and completes the booking lifecycle", async () => {
    const { farmer, buyer, admin, supply, demand } = await createPendingRecords();

    const supplyModerationResponse = await moderateSupply(
      testRequest(`/api/admin/supplies/${supply.id}/moderation`, {
        method: "PATCH",
        user: admin,
        body: { moderation_status: "approved", moderation_note: "Ready for matching." },
      }),
      routeContext(supply.id),
    );
    const demandModerationResponse = await moderateDemand(
      testRequest(`/api/admin/demands/${demand.id}/moderation`, {
        method: "PATCH",
        user: admin,
        body: { moderation_status: "approved" },
      }),
      routeContext(demand.id),
    );
    expect(supplyModerationResponse.status).toBe(200);
    expect(demandModerationResponse.status).toBe(200);

    const matchesResponse = await getMatches(
      testRequest(`/api/demands/${demand.id}/matches`, { user: buyer }),
      routeContext(demand.id),
    );
    const matches = await responseJson<{ matches: Array<{ id: number; moderation_status: string }> }>(matchesResponse);
    expect(matchesResponse.status).toBe(200);
    expect(matches.matches).toHaveLength(1);
    expect(matches.matches[0]).toMatchObject({ id: supply.id, moderation_status: "approved" });

    const bookingResponse = await createBooking(
      testRequest("/api/bookings", {
        method: "POST",
        user: buyer,
        body: {
          supplyId: supply.id,
          demandRequestId: demand.id,
          quantity: 100,
          unit: "kg",
        },
      }),
    );
    expect(bookingResponse.status).toBe(201);
    const booking = await responseJson<{ booking: { id: number } }>(bookingResponse);

    const afterCreate = await databaseRow<{ demand_status: string }>(
      `select status as demand_status from demand_requests where id = $1`,
      [demand.id],
    );
    expect(afterCreate?.demand_status).toBe("booked");

    const acceptResponse = await updateBooking(
      testRequest(`/api/bookings/${booking.booking.id}/status`, {
        method: "PATCH",
        user: farmer,
        body: { status: "accepted" },
      }),
      routeContext(booking.booking.id),
    );
    expect(acceptResponse.status).toBe(200);
    expect(
      (await databaseRow<{ status: string }>("select status from crop_supplies where id = $1", [supply.id]))?.status,
    ).toBe("booked");

    const completeResponse = await updateBooking(
      testRequest(`/api/bookings/${booking.booking.id}/status`, {
        method: "PATCH",
        user: admin,
        body: { status: "completed" },
      }),
      routeContext(booking.booking.id),
    );
    expect(completeResponse.status).toBe(200);

    expect(
      (await databaseRow<{ status: string }>("select status from demand_requests where id = $1", [demand.id]))?.status,
    ).toBe("fulfilled");
    expect(
      (await databaseRow<{ status: string }>("select status from crop_supplies where id = $1", [supply.id]))?.status,
    ).toBe("ready");

    const auditCount = await databaseRow<{ count: string }>(
      "select count(*)::text as count from admin_audit_logs where admin_user_id = $1",
      [admin.id],
    );
    const notificationCount = await databaseRow<{ count: string }>(
      "select count(*)::text as count from notifications",
    );
    expect(Number(auditCount?.count)).toBeGreaterThanOrEqual(2);
    expect(Number(notificationCount?.count)).toBeGreaterThanOrEqual(3);
  });
});
