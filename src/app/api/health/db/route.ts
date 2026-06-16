import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/database";

export async function GET() {
  try {
    const result = await getDb().query<{ now: Date }>("SELECT NOW() as now");

    return NextResponse.json({
      status: "ok",
      databaseTime: result.rows[0]?.now,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 },
    );
  }
}
