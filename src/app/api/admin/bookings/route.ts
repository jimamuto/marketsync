import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "../../../../lib/database";
import { getSessionRole, hasAdminAccess } from "../../../../lib/session";

export async function GET(request: NextRequest) {
  try {
    const role = getSessionRole(request);

    if (!hasAdminAccess(role)) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 },
      );
    }

    const result = await getDb().query(
      `select b.id, b.supply_id, b.demand_request_id, b.buyer_id, b.farmer_id,
              b.quantity, b.unit, b.status, b.message, b.created_at, b.updated_at,
              cs.crop_name, cs.location as supply_location,
              dr.location as demand_location,
              buyer.name as buyer_name,
              farmer.name as farmer_name
       from bookings b
       join crop_supplies cs on cs.id = b.supply_id
       join demand_requests dr on dr.id = b.demand_request_id
       join users buyer on buyer.id = b.buyer_id
       join users farmer on farmer.id = b.farmer_id
       order by b.created_at desc`,
    );

    return NextResponse.json(
      { bookings: result.rows },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to load admin bookings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
