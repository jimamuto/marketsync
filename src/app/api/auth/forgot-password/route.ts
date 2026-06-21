import { createHash, randomBytes } from "crypto"; //library for encryption purposes
import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/database";
import { sendMail } from "../../../../lib/mail";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    const userResult = await getDb().query(
      "select id, name, email from users where email = $1 limit 1",
      [email],
    );

    const genericResponse = NextResponse.json(
      {
        message:
          "If an account exists with this email, password reset instructions will be sent.",
      },
      { status: 200 },
    );

    if (userResult.rowCount === 0) {
      return genericResponse;
    }

    const user = userResult.rows[0];
    const resetToken = randomBytes(32).toString("hex");
    const tokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); //token expires in 30 minutes

    await getDb().query(
      `insert into password_reset_tokens (user_id, token_hash, expires_at)
       values ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt],
    );

    const resetUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/reset-password?token=${resetToken}`;

    try {
      await sendMail({
        to: user.email,
        subject: "MarketSync password reset",
        html: `
          <p>Hello ${user.name},</p>
          <p>Use the link below to reset your MarketSync password. This link expires in 30 minutes.</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        `,
      });
    } catch {
      // keep the response generic even if email delivery is not configured
    }

    return genericResponse;
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to process password reset request",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
