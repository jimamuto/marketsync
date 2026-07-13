import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "../../../../lib/database";
import { getSessionRole, getSessionUserId, hasFarmerAccess } from "../../../../lib/session";

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
  return ["planned", "growing", "ready", "booked", "cancelled"].includes(value);
}

async function getOwnedSupply(request: NextRequest, supplyId: number) {
  const userId = getSessionUserId(request);
  const role = getSessionRole(request);

  if (!userId || !hasFarmerAccess(role)) {
    return {
      status: 403,
      body: { message: "Only farmers can access crop supplies" },
    };
  }
//fetch supplies for farmer and admin
  const result =
    role === "admin"
      ? await getDb().query(
          `select cs.id, cs.farmer_id, cs.crop_name, cs.crop_variety, cs.quantity, cs.unit,
                  cs.planting_date, cs.expected_harvest_date, cs.location, cs.status,
                  cs.moderation_status, cs.moderation_note, cs.reviewed_at,
                  cs.created_at, cs.updated_at,
                  u.name as farmer_name, u.email as farmer_email
           from crop_supplies cs
           join users u on u.id = cs.farmer_id
           where cs.id = $1`,
          [supplyId],
        )
      : await getDb().query(
          `select id, farmer_id, crop_name, crop_variety, quantity, unit,
                  planting_date, expected_harvest_date, location, status,
                  moderation_status, moderation_note, reviewed_at,
                  created_at, updated_at
           from crop_supplies
           where id = $1 and farmer_id = $2`,
          [supplyId, userId],
        );

  if (result.rowCount === 0) {
    return {
      status: 404,
      body: { message: "Crop supply not found" },
    };
  }

  return {
    status: 200,
    body: { supply: result.rows[0] },
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supplyId = Number(id);
    if (!Number.isInteger(supplyId) || supplyId <= 0) { //use number helper to find valid number for id
      return NextResponse.json(
        { message: "Invalid supply id" },
        { status: 400 },
      );
    }

    const result = await getOwnedSupply(request, supplyId);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch crop supply",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
//update supplies
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const userId = getSessionUserId(request);
    const role = getSessionRole(request);

    if (!userId || !hasFarmerAccess(role)) {
      return NextResponse.json(
        { message: "Only farmers can update crop supplies" },
        { status: 403 },
      );
    }

    const { id } = await context.params;
    const supplyId = Number(id);
    if (!Number.isInteger(supplyId) || supplyId <= 0) {
      return NextResponse.json(
        { message: "Invalid supply id" },
        { status: 400 },
      );
    }
//check if supplies exist to the user
    const existing =
      role === "admin"
        ? await getDb().query("select id from crop_supplies where id = $1", [supplyId])
        : await getDb().query(
            "select id from crop_supplies where id = $1 and farmer_id = $2",
            [supplyId, userId],
          );

    if (existing.rowCount === 0) {
      return NextResponse.json(
        { message: "Crop supply not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    //create two arrays for updates and values
    const updates: string[] = [];
    const values: Array<string | number | null> = [];
//if crop name and cropName are provided possible types they are pushed to the arrays
    const cropName = body.crop_name ?? body.cropName;
    if (cropName !== undefined) {
      updates.push(`crop_name = $${values.length + 1}`); //keeps track of updates in the updates array
      values.push(String(cropName).trim()); //pushes the value of crop name to array once converted to array and trimmed
    }

    const cropVariety = body.crop_variety ?? body.cropVariety;
    if (cropVariety !== undefined) {
      updates.push(`crop_variety = $${values.length + 1}`);
      values.push(cropVariety ? String(cropVariety).trim() : null);
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

    const plantingDate = body.planting_date ?? body.plantingDate;
    if (plantingDate !== undefined) {
      updates.push(`planting_date = $${values.length + 1}`);
      values.push(normalizeDate(plantingDate));
    }

    const expectedHarvestDate = body.expected_harvest_date ?? body.expectedHarvestDate;
    if (expectedHarvestDate !== undefined) {
      updates.push(`expected_harvest_date = $${values.length + 1}`);
      values.push(normalizeDate(expectedHarvestDate));
    }

    if (body.location !== undefined) {
      updates.push(`location = $${values.length + 1}`);
      values.push(String(body.location).trim());
    }

    if (body.status !== undefined) {
      const status = String(body.status).trim().toLowerCase();
      if (!allowedStatus(status)) {
        return NextResponse.json(
          { message: "Invalid supply status" },
          { status: 400 },
        );
      }
      updates.push(`status = $${values.length + 1}`);
      values.push(status);
    }

    if (updates.length === 0) { //if update array empty
      return NextResponse.json(
        { message: "No valid fields provided to update" },
        { status: 400 },
      );
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");

//update all the fields in the database
    const result = await getDb().query(
      `update crop_supplies
       set ${updates.join(", ")}
       where id = $${values.length + 1}
       returning id, farmer_id, crop_name, crop_variety, quantity, unit, planting_date, expected_harvest_date, location, status,
                moderation_status, moderation_note, reviewed_at, created_at, updated_at`,
      [...values, supplyId],
    );
//return updated supply
    return NextResponse.json(
      { supply: result.rows[0] },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update crop supply",
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

    if (!userId || !hasFarmerAccess(role)) {
      return NextResponse.json(
        { message: "Only farmers can delete crop supplies" },
        { status: 403 },
      );
    }

    const { id } = await context.params;
    const supplyId = Number(id);
    if (!Number.isInteger(supplyId) || supplyId <= 0) {
      return NextResponse.json(
        { message: "Invalid supply id" },
        { status: 400 },
      );
    }

    const result =
      role === "admin"
        ? await getDb().query(
            "delete from crop_supplies where id = $1 returning id",
            [supplyId],
          )
        : await getDb().query(
            "delete from crop_supplies where id = $1 and farmer_id = $2 returning id",
            [supplyId, userId],
          );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Crop supply not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Crop supply deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete crop supply",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
