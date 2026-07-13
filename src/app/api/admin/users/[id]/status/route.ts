import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createNotification, writeAdminAuditLog } from "../../../../../../lib/admin";
import { getDb } from "../../../../../../lib/database";
import { getSessionRole, getSessionUserId, hasAdminAccess } from "../../../../../../lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const adminUserId = getSessionUserId(request);
    if (!adminUserId || !hasAdminAccess(getSessionRole(request))) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const userId = Number((await context.params).id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
    }
    if (userId === adminUserId) {
      return NextResponse.json({ message: "You cannot suspend your own account" }, { status: 400 });
    }

    const body = await request.json();
    const accountStatus = String(body.account_status ?? body.status ?? "").trim().toLowerCase();
    if (!["active", "suspended"].includes(accountStatus)) {
      return NextResponse.json({ message: "Invalid account status" }, { status: 400 });
    }

    const existing = await getDb().query(
      "select id, name, email, role, account_status from users where id = $1",
      [userId],
    );
    if (existing.rowCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    if (existing.rows[0].role === "admin") {
      return NextResponse.json({ message: "Admin accounts cannot be suspended here" }, { status: 400 });
    }

    const result = await getDb().query(
      `update users
       set account_status = $1, updated_at = CURRENT_TIMESTAMP
       where id = $2
       returning id, name, email, role, account_status, updated_at`,
      [accountStatus, userId],
    );

    const user = result.rows[0];
    await writeAdminAuditLog(adminUserId, `user_${accountStatus}`, "user", userId, {
      previous_status: existing.rows[0].account_status,
      account_status: accountStatus,
    });
    await createNotification(
      userId,
      accountStatus === "suspended" ? "Account suspended" : "Account reactivated",
      accountStatus === "suspended"
        ? "Your MarketSync account has been suspended by an administrator."
        : "Your MarketSync account has been reactivated.",
      "account_status_updated",
    );

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update user account status",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
