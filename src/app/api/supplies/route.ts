//farmers can create crop supplies and get crop supplies
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PRIVATE_CACHE_HEADERS } from "../../../lib/cache";
import { getDb } from "../../../lib/database";
import { getSessionRole, getSessionUserId, hasFarmerAccess } from "../../../lib/session";

// helper that converts value to number and validates numbers
function toNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}
//helper that trims whitespace from dates and returns "" for invalid dates
function normalizeDate(value: unknown) {
  const date = String(value ?? "").trim();
  return date || null;
}

export async function POST(request: NextRequest) {
  try {
    const userId = getSessionUserId(request);
    const role = getSessionRole(request);

    if (!userId || !hasFarmerAccess(role)) {
      return NextResponse.json(
        { message: "Only farmers can create crop supplies" },
        { status: 403 },
      );
    }

    const body = await request.json();

  //extract fields of supply variables
    const cropName = String(body.crop_name ?? body.cropName ?? "").trim();
    const cropVariety = body.crop_variety || body.cropVariety ? String(body.crop_variety ?? body.cropVariety).trim() : null;
    const quantity = toNumber(body.quantity);
    const unit = String(body.unit ?? "").trim();
    const plantingDate = normalizeDate(body.planting_date ?? body.plantingDate);
    const expectedHarvestDate = normalizeDate(body.expected_harvest_date ?? body.expectedHarvestDate);
    const location = String(body.location ?? "").trim();
    const status = String(body.status ?? "planned").trim().toLowerCase();

    if (!cropName || quantity === null || !unit || !plantingDate || !expectedHarvestDate || !location) {
      return NextResponse.json(
        {
          message:
            "crop_name, quantity, unit, planting_date, expected_harvest_date, and location are required",
        },
        { status: 400 },
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { message: "quantity must be greater than 0" },
        { status: 400 },
      );
    }

    if (new Date(expectedHarvestDate) < new Date(plantingDate)) {
      return NextResponse.json(
        { message: "expected_harvest_date must be on or after planting_date" },
        { status: 400 },
      );
    }

    const allowedStatuses = ["planned", "growing", "ready", "booked", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid supply status" },
        { status: 400 },
      );
    }

    const result = await getDb().query(
      `insert into crop_supplies
       (farmer_id, crop_name, crop_variety, quantity, unit, planting_date, expected_harvest_date, location, status, moderation_status)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
       returning id, farmer_id, crop_name, crop_variety, quantity, unit, planting_date, expected_harvest_date, location, status,
                moderation_status, moderation_note, reviewed_at, created_at, updated_at`,
      [
        userId,
        cropName,
        cropVariety,
        quantity,
        unit,
        plantingDate,
        expectedHarvestDate,
        location,
        status,
      ],
    );

    return NextResponse.json(
      { supply: result.rows[0] },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to create crop supply",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getSessionUserId(request);
    const role = getSessionRole(request);

    if (!userId || !hasFarmerAccess(role)) {
      return NextResponse.json(
        { message: "Only farmers can view crop supplies" },
        { status: 403 },
      );
    }

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
             order by cs.created_at desc`,
          )
        : await getDb().query(
            `select id, farmer_id, crop_name, crop_variety, quantity, unit,
                    planting_date, expected_harvest_date, location, status,
                    moderation_status, moderation_note, reviewed_at,
                    created_at, updated_at
             from crop_supplies
             where farmer_id = $1
             order by created_at desc`,
            [userId],
          );

    return NextResponse.json(
      { supplies: result.rows },
      { status: 200, headers: PRIVATE_CACHE_HEADERS },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch crop supplies",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
