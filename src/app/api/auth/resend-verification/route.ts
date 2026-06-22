import crypto from "crypto";
import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/database";
import { sendMail } from "../../../../lib/mail";

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
        `select id, name, email, email_verified_at from users where email = $1 limit 1`,
        [email],
      );

      //show generic response if user doesnt exist
    if(userResult.rowCount===0){
        return NextResponse.json(
        {message:"if an email with this account exists and is not verified we have sent verification details"},
          {status:200},
      );
      }

      //gather the first record from the database query
      const user = userResult.rows[0];
      if (user.email_verified_at) {
        return NextResponse.json(
          {message:"this user is already verified you can login"},
          {status:200},
        );
      }

      await getDb().query(
        "delete from email_verification_tokens where user_id = $1",
        [user.id],
      );

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

      await getDb().query(
        `insert into email_verification_tokens (user_id, token, expires_at)
        values ($1, $2, $3)`,
        [user.id, token, expiresAt],
      );

      const appUrl= process.env.APP_URL ?? "http://localhost:3000";
      const verifyUrl = `${appUrl}/api/auth/verify-email?token=${token}`;
      await sendMail({
         to: user.email,
         subject: "Verify your MarketSync account",
         html: `
           <p>Hello ${user.name},</p>
           <p>Click the link below to verify your email and log in:</p>
           <p><a href="${verifyUrl}">Verify my account</a></p>
           <p>This link expires in 30 minutes.</p>
         `,
       });

       return NextResponse.json(
         { message: "If this account exists and is not verified, we sent a new verification email." },
         { status: 200 },
       );

  }catch(error){
    return NextResponse.json(
         {
           message: "Failed to resend verification email",
           error: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 },
       );

  }
  
}
