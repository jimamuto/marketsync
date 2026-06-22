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
      `select cs.id, cs.farmer_id, cs.crop_name, cs.crop_variety, cs.quantity, cs.unit,
              cs.planting_date, cs.expected_harvest_date, cs.location, cs.status,
              cs.created_at, cs.updated_at,
              u.name as farmer_name, u.email as farmer_email
       from crop_supplies cs
       join users u on u.id = cs.farmer_id
       order by cs.created_at desc`,
    );

    return NextResponse.json(
      { supplies: result.rows },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to load admin supplies",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
