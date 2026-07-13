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

    const supplyId = Number((await context.params).id);
    if (!Number.isInteger(supplyId) || supplyId <= 0) {
      return NextResponse.json({ message: "Invalid supply id" }, { status: 400 });
    }

    const body = await request.json();
    const moderationStatus = String(body.moderation_status ?? body.status ?? "").trim().toLowerCase();
    if (!["pending", "approved", "rejected"].includes(moderationStatus)) {
      return NextResponse.json({ message: "Invalid moderation status" }, { status: 400 });
    }

    const existing = await getDb().query(
      `select id, farmer_id, crop_name, moderation_status
       from crop_supplies where id = $1`,
      [supplyId],
    );
    if (existing.rowCount === 0) {
      return NextResponse.json({ message: "Crop supply not found" }, { status: 404 });
    }

    const note = body.moderation_note ? String(body.moderation_note).trim() : null;
    const result = await getDb().query(
      `update crop_supplies
       set moderation_status = $1,
           moderation_note = $2,
           reviewed_by = $3,
           reviewed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       where id = $4
       returning id, crop_name, moderation_status, moderation_note, reviewed_at`,
      [moderationStatus, note, adminUserId, supplyId],
    );

    await writeAdminAuditLog(adminUserId, `supply_${moderationStatus}`, "supply", supplyId, {
      previous_status: existing.rows[0].moderation_status,
      moderation_status: moderationStatus,
      note,
    });
    await createNotification(
      existing.rows[0].farmer_id,
      "Crop supply review updated",
      `Your ${existing.rows[0].crop_name} supply was ${moderationStatus} by an administrator.`,
      "supply_moderation_updated",
    );

    return NextResponse.json({ supply: result.rows[0] }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update crop supply moderation",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
