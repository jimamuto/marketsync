import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/database";
import { hashPassword } from "../../../../lib/auth";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token ?? "").trim();
    const password = String(body.password ?? "");

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const tokenHash = hashToken(token);

    const tokenResult = await getDb().query(
      `select id, user_id, expires_at, used_at
       from password_reset_tokens
       where token_hash = $1
       limit 1`,
      [tokenHash],
    );

    if (tokenResult.rowCount === 0) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    const resetToken = tokenResult.rows[0];

    if (resetToken.used_at) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);

    await getDb().query(
      "update users set password_hash = $1, updated_at = CURRENT_TIMESTAMP where id = $2",
      [passwordHash, resetToken.user_id],
    );

    await getDb().query(
      "update password_reset_tokens set used_at = CURRENT_TIMESTAMP where id = $1",
      [resetToken.id],
    );

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to reset password",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
