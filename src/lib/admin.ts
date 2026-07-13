import { getDb } from "./database";

export async function writeAdminAuditLog(
  adminUserId: number,
  action: string,
  entityType: string,
  entityId: number | null,
  details: Record<string, unknown> = {},
) {
  await getDb().query(
    `insert into admin_audit_logs
       (admin_user_id, action, entity_type, entity_id, details)
     values ($1, $2, $3, $4, $5::jsonb)`,
    [adminUserId, action, entityType, entityId, JSON.stringify(details)],
  );
}

export async function createNotification(
  userId: number,
  title: string,
  message: string,
  type: string,
) {
  await getDb().query(
    `insert into notifications (user_id, title, message, type)
     values ($1, $2, $3, $4)`,
    [userId, title, message, type],
  );
}
