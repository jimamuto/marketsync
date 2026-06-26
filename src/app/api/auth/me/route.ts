//this file checks users session and user' profile date
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "../../../../lib/database";
import { getSessionUserId } from "../../../../lib/session";
import { tosafeUser } from "../../../../lib/auth";

//cleans optional fields like phone and location
function cleanOptionalText(value: unknown) {
  if (typeof value !== "string") { //if value not set return null
    return null;
  }

  const trimmed = value.trim(); //removes whitespace
  return trimmed.length > 0 ? trimmed : null;
}

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

export async function PATCH(request: NextRequest) {
  try {
    const userId = getSessionUserId(request);

    if (!userId) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = cleanOptionalText(body.phone);
    const location = cleanOptionalText(body.location);

    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 },
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { message: "Name must be 100 characters or fewer" },
        { status: 400 },
      );
    }

    if (phone && phone.length > 30) {
      return NextResponse.json(
        { message: "Phone must be 30 characters or fewer" },
        { status: 400 },
      );
    }

    if (location && location.length > 100) {
      return NextResponse.json(
        { message: "Location must be 100 characters or fewer" },
        { status: 400 },
      );
    }

    const result = await getDb().query(
      `update users
       set name = $1, phone = $2, location = $3, updated_at = CURRENT_TIMESTAMP
       where id = $4
       returning id, name, email, role, phone, location`,
      [name, phone, location, userId],
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
        message: "Failed to update current user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
