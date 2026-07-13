import { beforeEach, describe, expect, it } from "vitest";
import { POST as createDemand, GET as listDemands } from "../../src/app/api/demands/route";
import {
  DELETE as deleteDemand,
  GET as getDemand,
  PATCH as updateDemand,
} from "../../src/app/api/demands/[id]/route";
import { resetTestDatabase } from "../setup/integration";
import { createTestUser } from "../helpers/test-data";
import { responseJson, routeContext, testRequest } from "../helpers/test-request";
import { getDb } from "../../src/lib/database";

describe("buyer demand API with PostgreSQL", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  it("creates, reads, updates, and deletes a pending demand", async () => {
    const buyer = await createTestUser({ role: "buyer" });
    const createResponse = await createDemand(
      testRequest("/api/demands", {
        method: "POST",
        user: buyer,
        body: {
          crop_name: "Potatoes",
          quantity: 300,
          unit: "kg",
          required_date: "2026-08-10",
          location: "Nairobi",
          notes: "Grade A produce",
          status: "open",
        },
      }),
    );

    expect(createResponse.status).toBe(201);
    const created = await responseJson<{ demand: { id: number; moderation_status: string } }>(createResponse);
    expect(created.demand.moderation_status).toBe("pending");

    const stored = await getDb().query(
      "select buyer_id, status, moderation_status from demand_requests where id = $1",
      [created.demand.id],
    );
    expect(stored.rows[0]).toMatchObject({
      buyer_id: buyer.id,
      status: "open",
      moderation_status: "pending",
    });

    expect((await listDemands(testRequest("/api/demands", { user: buyer }))).status).toBe(200);
    expect(
      (
        await getDemand(
          testRequest(`/api/demands/${created.demand.id}`, { user: buyer }),
          routeContext(created.demand.id),
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await updateDemand(
          testRequest(`/api/demands/${created.demand.id}`, {
            method: "PATCH",
            user: buyer,
            body: { quantity: 350, notes: "Updated requirement" },
          }),
          routeContext(created.demand.id),
        )
      ).status,
    ).toBe(200);

    const updated = await getDb().query(
      "select quantity, notes, moderation_status from demand_requests where id = $1",
      [created.demand.id],
    );
    expect(updated.rows[0]).toMatchObject({
      quantity: "350.00",
      notes: "Updated requirement",
      moderation_status: "pending",
    });

    expect(
      (
        await deleteDemand(
          testRequest(`/api/demands/${created.demand.id}`, {
            method: "DELETE",
            user: buyer,
          }),
          routeContext(created.demand.id),
        )
      ).status,
    ).toBe(200);
    expect(
      (await getDb().query("select id from demand_requests where id = $1", [created.demand.id])).rowCount,
    ).toBe(0);
  });

  it("protects demand ownership and buyer-only access", async () => {
    const buyer = await createTestUser({ role: "buyer" });
    const otherBuyer = await createTestUser({ role: "buyer" });
    const farmer = await createTestUser({ role: "farmer" });
    const response = await createDemand(
      testRequest("/api/demands", {
        method: "POST",
        user: buyer,
        body: {
          crop_name: "Carrots",
          quantity: 100,
          unit: "kg",
          required_date: "2026-08-10",
          location: "Nairobi",
        },
      }),
    );
    const demand = await responseJson<{ demand: { id: number } }>(response);

    expect(
      (
        await getDemand(
          testRequest(`/api/demands/${demand.demand.id}`, { user: otherBuyer }),
          routeContext(demand.demand.id),
        )
      ).status,
    ).toBe(404);
    expect((await listDemands(testRequest("/api/demands", { user: farmer }))).status).toBe(403);
  });
});
