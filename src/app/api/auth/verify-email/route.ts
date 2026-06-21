import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/database";

const roleRoutes = {
  farmer: "/farmer",
  buyer: "/buyer",
  admin: "/admin",
} as const;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const result = await getDb().query(
      `select
          evt.id as token_id,
          evt.expires_at,
          u.id,
          u.name,
          u.email,
          u.role,
          u.phone,
          u.location
       from email_verification_tokens evt
       join users u on u.id = evt.user_id
       where evt.token = $1
       limit 1`,
      [token],
    );

    if (result.rowCount === 0) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const user = result.rows[0];

    if (new Date(user.expires_at) < new Date()) {
      await getDb().query(
        "delete from email_verification_tokens where id = $1",
        [user.token_id],
      );

      return NextResponse.redirect(new URL("/login", request.url));
    }

    await getDb().query(
      `update users
       set email_verified_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       where id = $1`,
      [user.id],
    );

    await getDb().query(
      "delete from email_verification_tokens where id = $1",
      [user.token_id],
    );

    const redirectPath = roleRoutes[user.role as keyof typeof roleRoutes] ?? "/";
    const response = NextResponse.redirect(new URL(redirectPath, request.url));

    response.cookies.set("session_user_id", String(user.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set("session_role", user.role, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
