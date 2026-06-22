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
      `select id, name, email, role, phone, location, email_verified_at, created_at, updated_at
       from users
       order by created_at desc`,
    );

    return NextResponse.json(
      { users: result.rows },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to load admin users",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
