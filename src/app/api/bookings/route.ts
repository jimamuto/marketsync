//manages booking requests from farmers that matches their demands
//buyers can create and fetch bookings
//when a buyer creates a booking, the farmer receives a "New booking request" notification
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PRIVATE_CACHE_HEADERS } from "../../../lib/cache";
import { getDb } from "../../../lib/database";
import { getSessionRole, getSessionUserId, hasBuyerAccess } from "../../../lib/session";

function toNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export async function POST(request: NextRequest) {
  try {
    const userId = getSessionUserId(request);
    const role = getSessionRole(request);

    if (!userId || !hasBuyerAccess(role)) {
      return NextResponse.json(
        { message: "Only buyers can create bookings" },
        { status: 403 },
      );
    }
//extract fields
    const body = await request.json();
    const supplyId = toNumber(body.supply_id ?? body.supplyId);
    const demandRequestId = toNumber(body.demand_request_id ?? body.demandRequestId);
    const quantity = toNumber(body.quantity);
    const unit = String(body.unit ?? "").trim();
    const message = body.message ? String(body.message).trim() : null;

    if (supplyId === null || demandRequestId === null || quantity === null || !unit) {
      return NextResponse.json(
        { message: "supply_id, demand_request_id, quantity, and unit are required" },
        { status: 400 },
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { message: "quantity must be greater than 0" },
        { status: 400 },
      );
    }
//find supplies from database
    const supplyResult = await getDb().query(
      `select id, farmer_id, crop_name, quantity, unit, location, status, moderation_status
       from crop_supplies
       where id = $1 and status in ('planned', 'growing', 'ready')`,
      [supplyId],
    );

    if (supplyResult.rowCount === 0) {
      return NextResponse.json(
        { message: "Supply not found or not available for booking" },
        { status: 404 },
      );
    }
// extract the first row
    const supply = supplyResult.rows[0];

    if (supply.moderation_status !== "approved") {
      return NextResponse.json(
        { message: "This supply must be approved before it can be booked." },
        { status: 409 },
      );
    }
//extract demand requests from database
    const demandResult = await getDb().query(
      `select id, buyer_id, crop_name, quantity, unit, location, status, moderation_status
       from demand_requests
       where id = $1 and buyer_id = $2`,
      [demandRequestId, userId],
    );

    if (demandResult.rowCount === 0) {
      return NextResponse.json(
        { message: "Demand request not found" },
        { status: 404 },
      );
    }

    const demand = demandResult.rows[0];

    if (demand.moderation_status !== "approved") {
      return NextResponse.json(
        { message: "This demand request must be approved before it can be booked." },
        { status: 409 },
      );
    }

    if (String(supply.crop_name).toLowerCase() !== String(demand.crop_name).toLowerCase()) {
      return NextResponse.json(
        { message: "Supply and demand crop names do not match" },
        { status: 400 },
      );
    }

    if (String(supply.location).toLowerCase() !== String(demand.location).toLowerCase()) {
      return NextResponse.json(
        { message: "Supply and demand locations do not match" },
        { status: 400 },
      );
    }

    if (String(supply.unit).toLowerCase() !== unit.toLowerCase() || String(demand.unit).toLowerCase() !== unit.toLowerCase()) {
      return NextResponse.json(
        { message: "Booking unit must match supply and demand units" },
        { status: 400 },
      );
    }

    if (quantity > Number(supply.quantity) || quantity > Number(demand.quantity)) {
      return NextResponse.json(
        { message: "Booking quantity cannot exceed supply or demand quantity" },
        { status: 400 },
      );
    }
//insert values into booking table
    const result = await getDb().query(
      `insert into bookings
       (supply_id, demand_request_id, buyer_id, farmer_id, quantity, unit, status, message)
       values ($1, $2, $3, $4, $5, $6, 'pending', $7)
       returning id, supply_id, demand_request_id, buyer_id, farmer_id, quantity, unit, status, message, created_at, updated_at`,
      [supplyId, demandRequestId, userId, supply.farmer_id, quantity, unit, message],
    );

    await getDb().query(
      `insert into notifications (user_id, title, message, type)
       values ($1, $2, $3, $4)`,
      [
        supply.farmer_id,
        "New booking request",
        `A buyer requested ${quantity} ${unit} of ${supply.crop_name}.`,
        "booking_created",
      ],
    );
//set booked status
    await getDb().query(
      "update demand_requests set status = 'booked', updated_at = CURRENT_TIMESTAMP where id = $1",
      [demandRequestId],
    );

    return NextResponse.json(
      { booking: result.rows[0] },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to create booking",
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

    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      );
    }

    const result =
      role === "admin"
        ? await getDb().query(
            `select b.id, b.supply_id, b.demand_request_id, b.buyer_id, b.farmer_id,
                    b.quantity, b.unit, b.status, b.message, b.created_at, b.updated_at,
                    cs.crop_name, cs.location as supply_location,
                    dr.location as demand_location
             from bookings b
             join crop_supplies cs on cs.id = b.supply_id
             join demand_requests dr on dr.id = b.demand_request_id
             order by b.created_at desc`,
          )
        : role === "farmer"
          ? await getDb().query(
              `select b.id, b.supply_id, b.demand_request_id, b.buyer_id, b.farmer_id,
                      b.quantity, b.unit, b.status, b.message, b.created_at, b.updated_at,
                      cs.crop_name, cs.location as supply_location,
                      dr.location as demand_location
               from bookings b
               join crop_supplies cs on cs.id = b.supply_id
               join demand_requests dr on dr.id = b.demand_request_id
               where b.farmer_id = $1
               order by b.created_at desc`,
              [userId],
            )
          : await getDb().query(
              `select b.id, b.supply_id, b.demand_request_id, b.buyer_id, b.farmer_id,
                      b.quantity, b.unit, b.status, b.message, b.created_at, b.updated_at,
                      cs.crop_name, cs.location as supply_location,
                      dr.location as demand_location
               from bookings b
               join crop_supplies cs on cs.id = b.supply_id
               join demand_requests dr on dr.id = b.demand_request_id
               where b.buyer_id = $1
               order by b.created_at desc`,
              [userId],
            );

    return NextResponse.json(
      { bookings: result.rows },
      { status: 200, headers: PRIVATE_CACHE_HEADERS },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch bookings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
