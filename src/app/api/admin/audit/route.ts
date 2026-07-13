import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PRIVATE_CACHE_HEADERS } from "../../../../lib/cache";
import { getDb } from "../../../../lib/database";
import { getSessionRole, hasAdminAccess } from "../../../../lib/session";

export async function GET(request: NextRequest) {
  try {
    if (!hasAdminAccess(getSessionRole(request))) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const result = await getDb().query(`
      select aal.id, aal.action, aal.entity_type, aal.entity_id,
             aal.details, aal.created_at, u.name as admin_name
      from admin_audit_logs aal
      join users u on u.id = aal.admin_user_id
      order by aal.created_at desc
      limit 100`);

    return NextResponse.json({ auditLogs: result.rows }, { status: 200, headers: PRIVATE_CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to load audit logs",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
