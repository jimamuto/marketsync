// used to fetch statuses of bookings
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "../../../../lib/database";
import { getSessionRole, getSessionUserId } from "../../../../lib/session";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function getAccessibleBooking(request: NextRequest, bookingId: number) {
  const userId = getSessionUserId(request);
  const role = getSessionRole(request);

  if (!userId) {
    return {
      status: 401,
      body: { message: "Authentication required" },
    };
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
           where b.id = $1`,
          [bookingId],
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
             where b.id = $1 and b.farmer_id = $2`,
            [bookingId, userId],
          )
        : await getDb().query(
            `select b.id, b.supply_id, b.demand_request_id, b.buyer_id, b.farmer_id,
                    b.quantity, b.unit, b.status, b.message, b.created_at, b.updated_at,
                    cs.crop_name, cs.location as supply_location,
                    dr.location as demand_location
             from bookings b
             join crop_supplies cs on cs.id = b.supply_id
             join demand_requests dr on dr.id = b.demand_request_id
             where b.id = $1 and b.buyer_id = $2`,
            [bookingId, userId],
          );

  if (result.rowCount === 0) {
    return {
      status: 404,
      body: { message: "Booking not found" },
    };
  }

  return {
    status: 200,
    body: { booking: result.rows[0] },
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const bookingId = Number(id);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return NextResponse.json(
        { message: "Invalid booking id" },
        { status: 400 },
      );
    }

    const result = await getAccessibleBooking(request, bookingId);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch booking",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH() {
  return NextResponse.json(
    { message: "Use /status for booking status updates" },
    { status: 405 },
  );
}
