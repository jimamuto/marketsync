//this file checks users session and user' profile date
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "../../../../lib/database";
import { getSessionUserId } from "../../../../lib/session";
import { tosafeUser } from "../../../../lib/auth";

export async function GET(request: NextRequest) {
  try {
    const userId = getSessionUserId(request);

    if (!userId) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 },
      );
    }

    const result = await getDb().query(
      `select id, name, email, role, phone, location
       from users
       where id = $1
       limit 1`,
      [userId],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { user: tosafeUser(result.rows[0]) },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch current user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
