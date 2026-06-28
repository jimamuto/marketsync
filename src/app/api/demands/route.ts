// used by buyers to create demands and fetch demands
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PRIVATE_CACHE_HEADERS } from "../../../lib/cache";
import { getDb } from "../../../lib/database";
import { getSessionRole, getSessionUserId, hasBuyerAccess } from "../../../lib/session";

function toNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeDate(value: unknown) {
  const date = String(value ?? "").trim();
  return date || null;
}

export async function POST(request: NextRequest) {
  try {
    const userId = getSessionUserId(request);
    const role = getSessionRole(request);

    if (!userId || !hasBuyerAccess(role)) {
      return NextResponse.json(
        { message: "Only buyers can create demand requests" },
        { status: 403 },
      );
    }

    const body = await request.json();

    const cropName = String(body.crop_name ?? body.cropName ?? "").trim();
    const quantity = toNumber(body.quantity);
    const unit = String(body.unit ?? "").trim();
    const requiredDate = normalizeDate(body.required_date ?? body.requiredDate);
    const location = String(body.location ?? "").trim();
    const notes = body.notes ? String(body.notes).trim() : null;
    const status = String(body.status ?? "open").trim().toLowerCase();

    if (!cropName || quantity === null || !unit || !requiredDate || !location) {
      return NextResponse.json(
        {
          message:
            "crop_name, quantity, unit, required_date, and location are required",
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

    const allowedStatuses = ["open", "matched", "booked", "cancelled", "fulfilled"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid demand status" },
        { status: 400 },
      );
    }

    const result = await getDb().query(
      `insert into demand_requests
       (buyer_id, crop_name, quantity, unit, required_date, location, notes, status)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       returning id, buyer_id, crop_name, quantity, unit, required_date, location, notes, status, created_at, updated_at`,
      [userId, cropName, quantity, unit, requiredDate, location, notes, status],
    );

    return NextResponse.json(
      { demand: result.rows[0] },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to create demand request",
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

    if (!userId || !hasBuyerAccess(role)) {
      return NextResponse.json(
        { message: "Only buyers can view demand requests" },
        { status: 403 },
      );
    }

    const result =
      role === "admin"
        ? await getDb().query(
            `select dr.id, dr.buyer_id, dr.crop_name, dr.quantity, dr.unit,
                    dr.required_date, dr.location, dr.notes, dr.status,
                    dr.created_at, dr.updated_at,
                    u.name as buyer_name, u.email as buyer_email
             from demand_requests dr
             join users u on u.id = dr.buyer_id
             order by dr.created_at desc`,
          )
        : await getDb().query(
            `select id, buyer_id, crop_name, quantity, unit, required_date,
                    location, notes, status, created_at, updated_at
             from demand_requests
             where buyer_id = $1
             order by created_at desc`,
            [userId],
          );

    return NextResponse.json(
      { demands: result.rows },
      { status: 200, headers: PRIVATE_CACHE_HEADERS },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch demand requests",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
