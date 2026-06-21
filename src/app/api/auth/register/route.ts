import crypto from "crypto";
import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/database";
import { IsvalidRole, hashPassword } from "../../../../lib/auth";
import { sendMail } from "../../../../lib/mail";

export async function POST(request: Request) {
  try {
    // extracting data from request
    const body = await request.json();

    // sanitizing input with type casting and type checks
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const role = body.role;
    const phone = body.phone ? String(body.phone).trim() : null;
    const location = body.location ? String(body.location).trim() : null;

    //validation
    if (!name || !email || !password || !role) {
     return NextResponse.json(
        {message:"Name, email,password,role are required"},
        {status: 400},
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {message:"password must be atleast 8 characters"},
        {status: 400},
      );

    }
    if (!IsvalidRole(role)) {
      return NextResponse.json(
        {message:"Role must be farmer, admin or buyer"},
        {status: 400},
      );
    }
//check against admin registering to system
    if (role === "admin") {
      return NextResponse.json(
        { message: "Admin accounts cannot be created through public registration" },
        { status: 403 },
      );
    }

    const existingUser = await getDb().query(
    "select id from users where email = $1",[email],
  );

    if (existingUser.rowCount && existingUser.rowCount >0 ) {
      return NextResponse.json(
        {message:"User already exists"},
        {status: 409},
      );
    }
    const passwordHash = await hashPassword(password);
    const result = await getDb().query(
      `insert into users (name,email,password_hash,role,phone,location)
       VALUES($1,$2,$3,$4,$5,$6)
       RETURNING id,name,email,role,phone,location
        `,
      [name,email,passwordHash,role,phone,location],

    );

    const user= result.rows[0];
    //generating of token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date (Date.now() + 1000 * 60 * 30 );

    await getDb().query(
      `insert into email_verification_tokens (user_id, token, expires_at)
       values ($1, $2, $3)`,
      [user.id, token, expiresAt],
    );

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
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

    // return success message
    return NextResponse.json(
      { message: "Account created. Please check your email to verify your account." },
      { status: 201 },
    );
  } catch (error){
    return NextResponse.json(
      {message:"Failed to register user",
      error: error instanceof Error ? error.message : "Unknown error",
      },
      {status:500},
    );
  }
}
