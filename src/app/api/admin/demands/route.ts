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
      `select dr.id, dr.buyer_id, dr.crop_name, dr.quantity, dr.unit,
              dr.required_date, dr.location, dr.notes, dr.status,
              dr.created_at, dr.updated_at,
              u.name as buyer_name, u.email as buyer_email
       from demand_requests dr
       join users u on u.id = dr.buyer_id
       order by dr.created_at desc`,
    );

    return NextResponse.json(
      { demands: result.rows },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to load admin demands",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
