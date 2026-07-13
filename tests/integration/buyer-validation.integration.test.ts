import { describe, expect, it } from "vitest";
import { POST as createDemand } from "../../src/app/api/demands/route";
import { DELETE as deleteDemand, PATCH as updateDemand } from "../../src/app/api/demands/[id]/route";
import { createDemandRecord, createTestUser } from "../helpers/test-data";
import { routeContext, testRequest } from "../helpers/test-request";

const validDemand = {
  crop_name: "Tomatoes",
  quantity: 100,
  unit: "kg",
  required_date: "2026-08-05",
  location: "Nairobi",
  status: "open",
};

describe("buyer demand validation and edge cases", () => {
  it("requires an authenticated buyer to create demands", async () => {
    const response = await createDemand(
      testRequest("/api/demands", { method: "POST", body: validDemand }),
    );
    expect(response.status).toBe(403);
  });

  it("rejects missing fields and non-positive quantities", async () => {
    const buyer = await createTestUser({ role: "buyer" });
    const missing = await createDemand(
      testRequest("/api/demands", {
        method: "POST",
        user: buyer,
        body: { crop_name: "Tomatoes" },
      }),
    );
    const negative = await createDemand(
      testRequest("/api/demands", {
        method: "POST",
        user: buyer,
        body: { ...validDemand, quantity: -10 },
      }),
    );

    expect(missing.status).toBe(400);
    expect(negative.status).toBe(400);
  });

  it("rejects unsupported demand lifecycle statuses", async () => {
    const buyer = await createTestUser({ role: "buyer" });
    const response = await createDemand(
      testRequest("/api/demands", {
        method: "POST",
        user: buyer,
        body: { ...validDemand, status: "archived" },
      }),
    );
    expect(response.status).toBe(400);
  });

  it("rejects invalid identifiers, empty updates, quantities, and statuses", async () => {
    const buyer = await createTestUser({ role: "buyer" });
    const demand = await createDemandRecord(buyer.id);

    const invalidId = await updateDemand(
      testRequest("/api/demands/nope", { method: "PATCH", user: buyer, body: { quantity: 20 } }),
      { params: Promise.resolve({ id: "nope" }) },
    );
    const empty = await updateDemand(
      testRequest(`/api/demands/${demand.id}`, { method: "PATCH", user: buyer, body: {} }),
      routeContext(demand.id),
    );
    const quantity = await updateDemand(
      testRequest(`/api/demands/${demand.id}`, { method: "PATCH", user: buyer, body: { quantity: 0 } }),
      routeContext(demand.id),
    );
    const status = await updateDemand(
      testRequest(`/api/demands/${demand.id}`, { method: "PATCH", user: buyer, body: { status: "archived" } }),
      routeContext(demand.id),
    );

    expect(invalidId.status).toBe(400);
    expect(empty.status).toBe(400);
    expect(quantity.status).toBe(400);
    expect(status.status).toBe(400);
  });

  it("prevents another buyer from deleting an owned demand", async () => {
    const owner = await createTestUser({ role: "buyer" });
    const otherBuyer = await createTestUser({ role: "buyer" });
    const demand = await createDemandRecord(owner.id);

    const response = await deleteDemand(
      testRequest(`/api/demands/${demand.id}`, { method: "DELETE", user: otherBuyer }),
      routeContext(demand.id),
    );
    expect(response.status).toBe(404);
  });
});
