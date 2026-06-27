import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "../../../../../lib/database";
import { getSessionUserId } from "../../../../../lib/session";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const userId = getSessionUserId(request);

    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const notificationId = Number(id);

    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return NextResponse.json(
        { message: "Invalid notification id" },
        { status: 400 },
      );
    }

    const result = await getDb().query(
      `update notifications
       set is_read = true
       where id = $1 and user_id = $2
       returning id, title, message, type, is_read, created_at`,
      [notificationId, userId],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { notification: result.rows[0] },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to mark notification as read",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
