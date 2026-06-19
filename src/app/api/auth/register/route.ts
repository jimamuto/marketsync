import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/database";
import { IsvalidRole, hashPassword, tosafeUser } from "../../../../lib/auth";

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
    if(role=="admin"){
      return NextResponse.json(
        {message:"admin can not be created through public registration"}
        {status:403}
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

    // return success message
    return NextResponse.json(
      {user:tosafeUser(result.rows[0])},
      {status:201},
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
