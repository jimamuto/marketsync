//used by buyers to fetch,update and delete demands
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "../../../../lib/database";
import { getSessionRole, getSessionUserId, hasBuyerAccess } from "../../../../lib/session";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function toNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeDate(value: unknown) {
  const date = String(value ?? "").trim();
  return date || null;
}

function allowedStatus(value: string) {
  return ["open", "matched", "booked", "cancelled", "fulfilled"].includes(value);
}

async function getOwnedDemand(request: NextRequest, demandId: number) {
  const userId = getSessionUserId(request);
  const role = getSessionRole(request);

  if (!userId || !hasBuyerAccess(role)) {
    return {
      status: 403,
      body: { message: "Only buyers can access demand requests" },
    };
  }

  const result =
    role === "admin"
      ? await getDb().query(
          `select dr.id, dr.buyer_id, dr.crop_name, dr.quantity, dr.unit,
                  dr.required_date, dr.location, dr.notes, dr.status,
                  dr.moderation_status, dr.moderation_note, dr.reviewed_at,
                  dr.created_at, dr.updated_at,
                  u.name as buyer_name, u.email as buyer_email
           from demand_requests dr
           join users u on u.id = dr.buyer_id
           where dr.id = $1`,
          [demandId],
        )
      : await getDb().query(
          `select id, buyer_id, crop_name, quantity, unit, required_date,
                  location, notes, status, moderation_status, moderation_note, reviewed_at,
                  created_at, updated_at
           from demand_requests
           where id = $1 and buyer_id = $2`,
          [demandId, userId],
        );

  if (result.rowCount === 0) {
    return {
      status: 404,
      body: { message: "Demand request not found" },
    };
  }

  return {
    status: 200,
    body: { demand: result.rows[0] },
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const demandId = Number(id);

    if (!Number.isInteger(demandId) || demandId <= 0) {
      return NextResponse.json(
        { message: "Invalid demand id" },
        { status: 400 },
      );
    }

    const result = await getOwnedDemand(request, demandId);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch demand request",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const userId = getSessionUserId(request);
    const role = getSessionRole(request);

    if (!userId || !hasBuyerAccess(role)) {
      return NextResponse.json(
        { message: "Only buyers can update demand requests" },
        { status: 403 },
      );
    }

    const { id } = await context.params;
    const demandId = Number(id);
    if (!Number.isInteger(demandId) || demandId <= 0) {
      return NextResponse.json(
        { message: "Invalid demand id" },
        { status: 400 },
      );
    }

    const existing =
      role === "admin"
        ? await getDb().query("select id from demand_requests where id = $1", [demandId])
        : await getDb().query(
            "select id from demand_requests where id = $1 and buyer_id = $2",
            [demandId, userId],
          );

    if (existing.rowCount === 0) {
      return NextResponse.json(
        { message: "Demand request not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const updates: string[] = [];
    const values: Array<string | number | null> = [];

    const cropName = body.crop_name ?? body.cropName;
    if (cropName !== undefined) {
      updates.push(`crop_name = $${values.length + 1}`);
      values.push(String(cropName).trim());
    }

    if (body.quantity !== undefined) {
      const quantity = toNumber(body.quantity);
      if (quantity === null || quantity <= 0) {
        return NextResponse.json(
          { message: "quantity must be greater than 0" },
          { status: 400 },
        );
      }
      updates.push(`quantity = $${values.length + 1}`);
      values.push(quantity);
    }

    if (body.unit !== undefined) {
      updates.push(`unit = $${values.length + 1}`);
      values.push(String(body.unit).trim());
    }

    const requiredDate = body.required_date ?? body.requiredDate;
    if (requiredDate !== undefined) {
      updates.push(`required_date = $${values.length + 1}`);
      values.push(normalizeDate(requiredDate));
    }

    if (body.location !== undefined) {
      updates.push(`location = $${values.length + 1}`);
      values.push(String(body.location).trim());
    }

    if (body.notes !== undefined) {
      updates.push(`notes = $${values.length + 1}`);
      values.push(body.notes ? String(body.notes).trim() : null);
    }

    if (body.status !== undefined) {
      const status = String(body.status).trim().toLowerCase();
      if (!allowedStatus(status)) {
        return NextResponse.json(
          { message: "Invalid demand status" },
          { status: 400 },
        );
      }
      updates.push(`status = $${values.length + 1}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "No valid fields provided to update" },
        { status: 400 },
      );
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");

    const result = await getDb().query(
      `update demand_requests
       set ${updates.join(", ")}
       where id = $${values.length + 1}
       returning id, buyer_id, crop_name, quantity, unit, required_date, location, notes, status,
                moderation_status, moderation_note, reviewed_at, created_at, updated_at`,
      [...values, demandId],
    );

    return NextResponse.json(
      { demand: result.rows[0] },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update demand request",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const userId = getSessionUserId(request);
    const role = getSessionRole(request);

    if (!userId || !hasBuyerAccess(role)) {
      return NextResponse.json(
        { message: "Only buyers can delete demand requests" },
        { status: 403 },
      );
    }

    const { id } = await context.params;
    const demandId = Number(id);
    if (!Number.isInteger(demandId) || demandId <= 0) {
      return NextResponse.json(
        { message: "Invalid demand id" },
        { status: 400 },
      );
    }

    const result =
      role === "admin"
        ? await getDb().query(
            "delete from demand_requests where id = $1 returning id",
            [demandId],
          )
        : await getDb().query(
            "delete from demand_requests where id = $1 and buyer_id = $2 returning id",
            [demandId, userId],
          );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Demand request not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Demand request deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete demand request",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
