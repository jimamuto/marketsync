import { describe, expect, it } from "vitest";
import { POST as createSupply, GET as listSupplies } from "../../src/app/api/supplies/route";
import {
  DELETE as deleteSupply,
  GET as getSupply,
  PATCH as updateSupply,
} from "../../src/app/api/supplies/[id]/route";
import { createTestUser } from "../helpers/test-data";
import { responseJson, routeContext, testRequest } from "../helpers/test-request";
import { getDb } from "../../src/lib/database";

describe("farmer supply API with PostgreSQL", () => {
  it("creates, reads, updates, and deletes a pending supply", async () => {
    const farmer = await createTestUser({ role: "farmer" });
    const payload = {
      crop_name: "Tomatoes",
      crop_variety: "Roma",
      quantity: 200,
      unit: "kg",
      planting_date: "2026-07-01",
      expected_harvest_date: "2026-08-01",
      location: "Nairobi",
      status: "planned",
    };

    const createResponse = await createSupply(
      testRequest("/api/supplies", { method: "POST", body: payload, user: farmer }),
    );
    expect(createResponse.status).toBe(201);
    const created = await responseJson<{ supply: { id: number; moderation_status: string } }>(createResponse);
    expect(created.supply.moderation_status).toBe("pending");

    const stored = await getDb().query(
      "select farmer_id, status, moderation_status from crop_supplies where id = $1",
      [created.supply.id],
    );
    expect(stored.rows[0]).toMatchObject({
      farmer_id: farmer.id,
      status: "planned",
      moderation_status: "pending",
    });

    const listResponse = await listSupplies(testRequest("/api/supplies", { user: farmer }));
    expect(listResponse.status).toBe(200);
    expect((await responseJson<{ supplies: Array<{ id: number }> }>(listResponse)).supplies).toHaveLength(1);

    const readResponse = await getSupply(
      testRequest(`/api/supplies/${created.supply.id}`, { user: farmer }),
      routeContext(created.supply.id),
    );
    expect(readResponse.status).toBe(200);

    const updateResponse = await updateSupply(
      testRequest(`/api/supplies/${created.supply.id}`, {
        method: "PATCH",
        body: { quantity: 250, status: "growing" },
        user: farmer,
      }),
      routeContext(created.supply.id),
    );
    expect(updateResponse.status).toBe(200);

    const updated = await getDb().query(
      "select quantity, status, moderation_status from crop_supplies where id = $1",
      [created.supply.id],
    );
    expect(updated.rows[0]).toMatchObject({
      quantity: "250.00",
      status: "growing",
      moderation_status: "pending",
    });

    const deleteResponse = await deleteSupply(
      testRequest(`/api/supplies/${created.supply.id}`, { method: "DELETE", user: farmer }),
      routeContext(created.supply.id),
    );
    expect(deleteResponse.status).toBe(200);
    expect(
      (await getDb().query("select id from crop_supplies where id = $1", [created.supply.id])).rowCount,
    ).toBe(0);
  });

  it("protects supply ownership and farmer-only access", async () => {
    const farmer = await createTestUser({ role: "farmer" });
    const otherFarmer = await createTestUser({ role: "farmer" });
    const buyer = await createTestUser({ role: "buyer" });
    const response = await createSupply(
      testRequest("/api/supplies", {
        method: "POST",
        user: farmer,
        body: {
          crop_name: "Onions",
          quantity: 100,
          unit: "kg",
          planting_date: "2026-07-01",
          expected_harvest_date: "2026-08-01",
          location: "Nairobi",
        },
      }),
    );
    const supply = await responseJson<{ supply: { id: number } }>(response);

    expect(
      (
        await getSupply(
          testRequest(`/api/supplies/${supply.supply.id}`, { user: otherFarmer }),
          routeContext(supply.supply.id),
        )
      ).status,
    ).toBe(404);
    expect((await listSupplies(testRequest("/api/supplies", { user: buyer }))).status).toBe(403);
  });
});
