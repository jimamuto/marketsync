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

    const db = getDb();
    const [counts, pendingBookings, pendingSupplies, pendingDemands, unverifiedUsers, unmatchedDemands, recentActivity] =
      await Promise.all([
        db.query(`
          select
            (select count(*)::int from bookings where status = 'pending') as pending_bookings,
            (select count(*)::int from crop_supplies where moderation_status = 'pending') as pending_supplies,
            (select count(*)::int from demand_requests where moderation_status = 'pending') as pending_demands,
            (select count(*)::int from users where role <> 'admin' and email_verified_at is null and account_status = 'active') as unverified_users,
            (select count(*)::int from demand_requests dr
             where dr.status = 'open'
               and dr.moderation_status = 'approved'
               and not exists (
                 select 1 from crop_supplies cs
                 where lower(trim(cs.crop_name)) = lower(trim(dr.crop_name))
                   and cs.unit = dr.unit
                   and cs.status in ('planned', 'growing', 'ready')
                   and cs.moderation_status = 'approved'
               )) as unmatched_demands,
            (select count(*)::int from crop_supplies
             where expected_harvest_date < current_date
               and status not in ('cancelled', 'booked')) as overdue_supplies`),
        db.query(`
          select b.id, b.quantity, b.unit, b.status, b.created_at,
                 cs.crop_name, buyer.name as buyer_name, farmer.name as farmer_name
          from bookings b
          join crop_supplies cs on cs.id = b.supply_id
          join users buyer on buyer.id = b.buyer_id
          join users farmer on farmer.id = b.farmer_id
          where b.status = 'pending'
          order by b.created_at asc
          limit 5`),
        db.query(`
          select cs.id, cs.crop_name, cs.quantity, cs.unit, cs.location,
                 cs.created_at, u.name as farmer_name
          from crop_supplies cs
          join users u on u.id = cs.farmer_id
          where cs.moderation_status = 'pending'
          order by cs.created_at asc
          limit 5`),
        db.query(`
          select dr.id, dr.crop_name, dr.quantity, dr.unit, dr.location,
                 dr.required_date, dr.created_at, u.name as buyer_name
          from demand_requests dr
          join users u on u.id = dr.buyer_id
          where dr.moderation_status = 'pending'
          order by dr.created_at asc
          limit 5`),
        db.query(`
          select id, name, email, role, created_at
          from users
          where role <> 'admin' and email_verified_at is null and account_status = 'active'
          order by created_at desc
          limit 5`),
        db.query(`
          select dr.id, dr.crop_name, dr.quantity, dr.unit, dr.location,
                 dr.required_date, u.name as buyer_name
          from demand_requests dr
          join users u on u.id = dr.buyer_id
          where dr.status = 'open'
            and dr.moderation_status = 'approved'
            and not exists (
              select 1 from crop_supplies cs
              where lower(trim(cs.crop_name)) = lower(trim(dr.crop_name))
                and cs.unit = dr.unit
                and cs.status in ('planned', 'growing', 'ready')
                and cs.moderation_status = 'approved'
            )
          order by dr.required_date asc, dr.created_at asc
          limit 5`),
        db.query(`
          select aal.id, aal.action, aal.entity_type, aal.entity_id,
                 aal.details, aal.created_at, u.name as admin_name
          from admin_audit_logs aal
          join users u on u.id = aal.admin_user_id
          order by aal.created_at desc
          limit 8`),
      ]);

    return NextResponse.json(
      {
        actionCenter: {
          counts: counts.rows[0],
          pendingBookings: pendingBookings.rows,
          pendingSupplies: pendingSupplies.rows,
          pendingDemands: pendingDemands.rows,
          unverifiedUsers: unverifiedUsers.rows,
          unmatchedDemands: unmatchedDemands.rows,
          recentActivity: recentActivity.rows,
        },
      },
      { status: 200, headers: PRIVATE_CACHE_HEADERS },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to load admin action center",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
