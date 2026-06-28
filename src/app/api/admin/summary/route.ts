import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PRIVATE_CACHE_HEADERS } from "../../../../lib/cache";
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

    const [usersResult, suppliesResult, demandsResult, bookingsResult] =
      await Promise.all([
        getDb().query("select count(*)::int as count from users"),
        getDb().query("select count(*)::int as count from crop_supplies"),
        getDb().query("select count(*)::int as count from demand_requests"),
        getDb().query("select count(*)::int as count from bookings"),
      ]);

    return NextResponse.json(
      {
        summary: {
          users: usersResult.rows[0].count,
          supplies: suppliesResult.rows[0].count,
          demands: demandsResult.rows[0].count,
          bookings: bookingsResult.rows[0].count,
        },
      },
      { status: 200, headers: PRIVATE_CACHE_HEADERS },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to load admin summary",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
