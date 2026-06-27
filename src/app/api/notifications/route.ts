import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "../../../lib/database";
import { getSessionUserId } from "../../../lib/session";

export async function GET(request: NextRequest) {
  try {
    const userId = getSessionUserId(request);

    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      );
    }

    const result = await getDb().query(
      `select id, title, message, type, is_read, created_at
       from notifications
       where user_id = $1
       order by created_at desc
       limit 10`,
      [userId],
    );

    const unreadResult = await getDb().query(
      `select count(*)::int as unread_count
       from notifications
       where user_id = $1 and is_read = false`,
      [userId],
    );

    return NextResponse.json(
      {
        notifications: result.rows,
        unreadCount: unreadResult.rows[0]?.unread_count ?? 0,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch notifications",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
