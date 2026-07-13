import { describe, expect, it } from "vitest";
import { POST as createSupply } from "../../src/app/api/supplies/route";
import { DELETE as deleteSupply, PATCH as updateSupply } from "../../src/app/api/supplies/[id]/route";
import { createSupplyRecord, createTestUser } from "../helpers/test-data";
import { routeContext, testRequest } from "../helpers/test-request";

const validSupply = {
  crop_name: "Tomatoes",
  quantity: 100,
  unit: "kg",
  planting_date: "2026-07-01",
  expected_harvest_date: "2026-08-01",
  location: "Nairobi",
  status: "planned",
};

describe("farmer supply validation and edge cases", () => {
  it("requires an authenticated farmer to create supplies", async () => {
    const response = await createSupply(
      testRequest("/api/supplies", { method: "POST", body: validSupply }),
    );
    expect(response.status).toBe(403);
  });

  it("rejects missing fields and non-positive quantities", async () => {
    const farmer = await createTestUser({ role: "farmer" });
    const missing = await createSupply(
      testRequest("/api/supplies", {
        method: "POST",
        user: farmer,
        body: { crop_name: "Tomatoes" },
      }),
    );
    const zero = await createSupply(
      testRequest("/api/supplies", {
        method: "POST",
        user: farmer,
        body: { ...validSupply, quantity: 0 },
      }),
    );

    expect(missing.status).toBe(400);
    expect(zero.status).toBe(400);
  });

  it("rejects harvest dates before planting dates", async () => {
    const farmer = await createTestUser({ role: "farmer" });
    const response = await createSupply(
      testRequest("/api/supplies", {
        method: "POST",
        user: farmer,
        body: {
          ...validSupply,
          planting_date: "2026-08-01",
          expected_harvest_date: "2026-07-01",
        },
      }),
    );
    expect(response.status).toBe(400);
  });

  it("rejects unsupported supply lifecycle statuses", async () => {
    const farmer = await createTestUser({ role: "farmer" });
    const response = await createSupply(
      testRequest("/api/supplies", {
        method: "POST",
        user: farmer,
        body: { ...validSupply, status: "sold" },
      }),
    );
    expect(response.status).toBe(400);
  });

  it("rejects invalid identifiers, empty updates, quantities, and statuses", async () => {
    const farmer = await createTestUser({ role: "farmer" });
    const supply = await createSupplyRecord(farmer.id);

    const invalidId = await updateSupply(
      testRequest("/api/supplies/not-a-number", { method: "PATCH", user: farmer, body: { quantity: 10 } }),
      { params: Promise.resolve({ id: "not-a-number" }) },
    );
    const empty = await updateSupply(
      testRequest(`/api/supplies/${supply.id}`, { method: "PATCH", user: farmer, body: {} }),
      routeContext(supply.id),
    );
    const quantity = await updateSupply(
      testRequest(`/api/supplies/${supply.id}`, { method: "PATCH", user: farmer, body: { quantity: -1 } }),
      routeContext(supply.id),
    );
    const status = await updateSupply(
      testRequest(`/api/supplies/${supply.id}`, { method: "PATCH", user: farmer, body: { status: "sold" } }),
      routeContext(supply.id),
    );

    expect(invalidId.status).toBe(400);
    expect(empty.status).toBe(400);
    expect(quantity.status).toBe(400);
    expect(status.status).toBe(400);
  });

  it("prevents another farmer from deleting an owned supply", async () => {
    const owner = await createTestUser({ role: "farmer" });
    const otherFarmer = await createTestUser({ role: "farmer" });
    const supply = await createSupplyRecord(owner.id);

    const response = await deleteSupply(
      testRequest(`/api/supplies/${supply.id}`, { method: "DELETE", user: otherFarmer }),
      routeContext(supply.id),
    );
    expect(response.status).toBe(404);
  });
});
