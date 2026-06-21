import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "../../../../../lib/database";
import { getSessionRole, getSessionUserId } from "../../../../../lib/session";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isValidStatus(status: string) {
  return ["pending", "accepted", "rejected", "cancelled", "completed"].includes(status);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const userId = getSessionUserId(request);
    const role = getSessionRole(request);

    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const bookingId = Number(id);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return NextResponse.json(
        { message: "Invalid booking id" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const status = String(body.status ?? "").trim().toLowerCase();

    if (!isValidStatus(status)) {
      return NextResponse.json(
        { message: "Invalid booking status" },
        { status: 400 },
      );
    }

    const bookingResult =
      role === "admin"
        ? await getDb().query(
            `select b.id, b.supply_id, b.buyer_id, b.farmer_id, b.status
             from bookings b
             where b.id = $1`,
            [bookingId],
          )
        : role === "farmer"
          ? await getDb().query(
              `select b.id, b.supply_id, b.buyer_id, b.farmer_id, b.status
               from bookings b
               where b.id = $1 and b.farmer_id = $2`,
              [bookingId, userId],
            )
          : await getDb().query(
              `select b.id, b.supply_id, b.buyer_id, b.farmer_id, b.status
               from bookings b
               where b.id = $1 and b.buyer_id = $2`,
              [bookingId, userId],
            );

    if (bookingResult.rowCount === 0) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    const booking = bookingResult.rows[0];

    if (role === "buyer" && status !== "cancelled") {
      return NextResponse.json(
        { message: "Buyers can only cancel their bookings" },
        { status: 403 },
      );
    }

    if (role === "farmer" && !["accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { message: "Farmers can only accept or reject bookings" },
        { status: 403 },
      );
    }

    if (booking.status === "completed" && status !== "completed") {
      return NextResponse.json(
        { message: "Completed bookings cannot be changed" },
        { status: 400 },
      );
    }

    const result = await getDb().query(
      `update bookings
       set status = $1, updated_at = CURRENT_TIMESTAMP
       where id = $2
       returning id, supply_id, demand_request_id, buyer_id, farmer_id, quantity, unit, status, message, created_at, updated_at`,
      [status, bookingId],
    );

    if (status === "accepted") {
      await getDb().query(
        "update crop_supplies set status = 'booked', updated_at = CURRENT_TIMESTAMP where id = $1",
        [booking.supply_id],
      );
    }

    if (status === "rejected" || status === "cancelled") {
      await getDb().query(
        "update demand_requests set status = 'open', updated_at = CURRENT_TIMESTAMP where id = (select demand_request_id from bookings where id = $1)",
        [bookingId],
      );
    }

    if (status === "completed") {
      await getDb().query(
        "update demand_requests set status = 'fulfilled', updated_at = CURRENT_TIMESTAMP where id = (select demand_request_id from bookings where id = $1)",
        [bookingId],
      );
      await getDb().query(
        "update crop_supplies set status = 'ready', updated_at = CURRENT_TIMESTAMP where id = (select supply_id from bookings where id = $1)",
        [bookingId],
      );
    }

    return NextResponse.json(
      { booking: result.rows[0] },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update booking status",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
