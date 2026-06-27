import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "../../../../lib/database";
import { getSessionUserId } from "../../../../lib/session";

export async function PATCH(request: NextRequest) {
  try {
    const userId = getSessionUserId(request);

    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      );
    }

    await getDb().query(
      `update notifications
       set is_read = true
       where user_id = $1 and is_read = false`,
      [userId],
    );

    return NextResponse.json(
      { message: "Notifications marked as read" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to mark notifications as read",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
