import { describe, expect, it } from "vitest";
import { GET as listBookings, POST as createBooking } from "../../src/app/api/bookings/route";
import { PATCH as updateBooking } from "../../src/app/api/bookings/[id]/status/route";
import {
  createBookingRecord,
  createDemandRecord,
  createSupplyRecord,
  createTestUser,
  databaseRow,
} from "../helpers/test-data";
import { routeContext, testRequest } from "../helpers/test-request";

async function marketplaceRecords(options: {
  supply?: Parameters<typeof createSupplyRecord>[1];
  demand?: Parameters<typeof createDemandRecord>[1];
} = {}) {
  const farmer = await createTestUser({ role: "farmer" });
  const buyer = await createTestUser({ role: "buyer" });
  const supply = await createSupplyRecord(farmer.id, options.supply);
  const demand = await createDemandRecord(buyer.id, options.demand);
  return { farmer, buyer, supply, demand };
}

function bookingRequest(
  buyer: { id: number; role: "buyer" },
  supplyId: number,
  demandId: number,
  overrides: Record<string, unknown> = {},
) {
  return testRequest("/api/bookings", {
    method: "POST",
    user: buyer,
    body: {
      supplyId,
      demandRequestId: demandId,
      quantity: 100,
      unit: "kg",
      ...overrides,
    },
  });
}

describe("booking validation and lifecycle edge cases", () => {
  it("allows only buyers to create bookings", async () => {
    const { farmer, supply, demand } = await marketplaceRecords();
    const response = await createBooking(
      testRequest("/api/bookings", {
        method: "POST",
        user: farmer,
        body: { supplyId: supply.id, demandRequestId: demand.id, quantity: 100, unit: "kg" },
      }),
    );
    expect(response.status).toBe(403);
  });

  it("rejects missing fields and non-positive booking quantities", async () => {
    const { buyer, supply, demand } = await marketplaceRecords();
    const missing = await createBooking(
      testRequest("/api/bookings", { method: "POST", user: buyer, body: { supplyId: supply.id } }),
    );
    const zero = await createBooking(bookingRequest(buyer, supply.id, demand.id, { quantity: 0 }));

    expect(missing.status).toBe(400);
    expect(zero.status).toBe(400);
  });

  it("blocks rejected supplies from booking", async () => {
    const { buyer, supply, demand } = await marketplaceRecords({
      supply: { moderationStatus: "rejected" },
    });
    expect((await createBooking(bookingRequest(buyer, supply.id, demand.id))).status).toBe(409);
  });

  it("blocks pending demands even when the supply is approved", async () => {
    const { buyer, supply, demand } = await marketplaceRecords({
      demand: { moderationStatus: "pending" },
    });
    expect((await createBooking(bookingRequest(buyer, supply.id, demand.id))).status).toBe(409);
  });

  it.each([
    ["crop names", { supply: { cropName: "Beans" }, demand: { cropName: "Tomatoes" } }, {}],
    ["locations", { supply: { location: "Nakuru" }, demand: { location: "Nairobi" } }, {}],
    ["units", { supply: { unit: "bags" }, demand: { unit: "kg" } }, {}],
    ["available quantities", { supply: { quantity: 50 }, demand: { quantity: 200 } }, { quantity: 100 }],
  ])("rejects mismatched %s", async (_label, records, bookingOverrides) => {
    const { buyer, supply, demand } = await marketplaceRecords(records);
    const response = await createBooking(
      bookingRequest(buyer, supply.id, demand.id, bookingOverrides),
    );
    expect(response.status).toBe(400);
  });

  it("prevents a buyer from booking another buyer's demand", async () => {
    const { buyer, supply, demand } = await marketplaceRecords();
    const otherBuyer = await createTestUser({ role: "buyer" });
    expect((await createBooking(bookingRequest(otherBuyer, supply.id, demand.id))).status).toBe(404);
    expect((await listBookings(testRequest("/api/bookings", { user: buyer }))).status).toBe(200);
  });

  it("enforces buyer and farmer booking transition permissions", async () => {
    const { farmer, buyer, supply, demand } = await marketplaceRecords();
    const booking = await createBookingRecord({
      supplyId: supply.id,
      demandId: demand.id,
      buyerId: buyer.id,
      farmerId: farmer.id,
    });

    const buyerAccept = await updateBooking(
      testRequest(`/api/bookings/${booking.id}/status`, {
        method: "PATCH",
        user: buyer,
        body: { status: "accepted" },
      }),
      routeContext(booking.id),
    );
    const farmerComplete = await updateBooking(
      testRequest(`/api/bookings/${booking.id}/status`, {
        method: "PATCH",
        user: farmer,
        body: { status: "completed" },
      }),
      routeContext(booking.id),
    );

    expect(buyerAccept.status).toBe(403);
    expect(farmerComplete.status).toBe(403);
  });

  it("rejects invalid booking identifiers and statuses", async () => {
    const buyer = await createTestUser({ role: "buyer" });
    const invalidId = await updateBooking(
      testRequest("/api/bookings/nope/status", { method: "PATCH", user: buyer, body: { status: "cancelled" } }),
      { params: Promise.resolve({ id: "nope" }) },
    );
    const invalidStatus = await updateBooking(
      testRequest("/api/bookings/99/status", { method: "PATCH", user: buyer, body: { status: "shipped" } }),
      routeContext(99),
    );

    expect(invalidId.status).toBe(400);
    expect(invalidStatus.status).toBe(400);
  });

  it("reopens a demand when its buyer cancels a booking", async () => {
    const { farmer, buyer, supply, demand } = await marketplaceRecords({ demand: { status: "booked" } });
    const booking = await createBookingRecord({
      supplyId: supply.id,
      demandId: demand.id,
      buyerId: buyer.id,
      farmerId: farmer.id,
    });

    const response = await updateBooking(
      testRequest(`/api/bookings/${booking.id}/status`, {
        method: "PATCH",
        user: buyer,
        body: { status: "cancelled" },
      }),
      routeContext(booking.id),
    );
    expect(response.status).toBe(200);
    expect(
      (await databaseRow<{ status: string }>("select status from demand_requests where id = $1", [demand.id]))?.status,
    ).toBe("open");
  });

  it("reopens a demand when its farmer rejects a booking", async () => {
    const { farmer, buyer, supply, demand } = await marketplaceRecords({ demand: { status: "booked" } });
    const booking = await createBookingRecord({
      supplyId: supply.id,
      demandId: demand.id,
      buyerId: buyer.id,
      farmerId: farmer.id,
    });

    const response = await updateBooking(
      testRequest(`/api/bookings/${booking.id}/status`, {
        method: "PATCH",
        user: farmer,
        body: { status: "rejected" },
      }),
      routeContext(booking.id),
    );
    expect(response.status).toBe(200);
    expect(
      (await databaseRow<{ status: string }>("select status from demand_requests where id = $1", [demand.id]))?.status,
    ).toBe("open");
  });

  it("prevents completed bookings from returning to another state", async () => {
    const { farmer, buyer, supply, demand } = await marketplaceRecords({ demand: { status: "fulfilled" } });
    const admin = await createTestUser({ role: "admin" });
    const booking = await createBookingRecord({
      supplyId: supply.id,
      demandId: demand.id,
      buyerId: buyer.id,
      farmerId: farmer.id,
      status: "completed",
    });

    const response = await updateBooking(
      testRequest(`/api/bookings/${booking.id}/status`, {
        method: "PATCH",
        user: admin,
        body: { status: "cancelled" },
      }),
      routeContext(booking.id),
    );
    expect(response.status).toBe(400);
  });
});
