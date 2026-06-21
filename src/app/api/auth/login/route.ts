import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/database";
import { confirmPassword, tosafeUser } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    // extracting data from request
    const body = await request.json();

    // sanitizing input with type casting and type checks
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    // validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    // find user by email
    const result = await getDb().query(
      "select id, name, email, password_hash, role, phone, location, email_verified_at from users where email = $1",
      [email],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const user = result.rows[0];

    // check password against stored hash
    const passwordMatches = await confirmPassword(password, user.password_hash);

    if (!passwordMatches) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    if (!user.email_verified_at) {
      return NextResponse.json(
        { message: "Please verify your email before logging in." },
        { status: 403 },
      );
    }

    const safeUser = tosafeUser(user);

    // build response and set a simple http-only cookie so the browser
    // remembers the user is logged in
    const response = NextResponse.json(
      { user: safeUser },
      { status: 200 },
    );

    response.cookies.set("session_user_id", String(user.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.cookies.set("session_role", user.role, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to log in",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
