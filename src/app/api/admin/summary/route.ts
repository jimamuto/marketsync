import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PRIVATE_CACHE_HEADERS } from "../../../../lib/cache";
import { getDb } from "../../../../lib/database";
import { getSessionRole, hasAdminAccess } from "../../../../lib/session";

export async function GET(request: NextRequest) {
  try {
    const role = getSessionRole(request);

    if (!hasAdminAccess(role)) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 },
      );
    }

    const [
      usersResult,
      suppliesResult,
      demandsResult,
      bookingsResult,
      demandSupplyGapResult,
      harvestProjectionResult,
    ] = await Promise.all([
      getDb().query("select count(*)::int as count from users"),
      getDb().query("select count(*)::int as count from crop_supplies"),
      getDb().query("select count(*)::int as count from demand_requests"),
      getDb().query("select count(*)::int as count from bookings"),
      getDb().query(
        `with demand_totals as (
           select lower(trim(crop_name)) as crop_key,
                  min(crop_name) as crop_name,
                  unit,
                  coalesce(sum(quantity), 0)::numeric as requested_quantity
           from demand_requests
           where status <> 'cancelled'
           group by lower(trim(crop_name)), unit
         ), supply_totals as (
           select lower(trim(crop_name)) as crop_key,
                  unit,
                  coalesce(sum(quantity), 0)::numeric as available_quantity
           from crop_supplies
           where status in ('planned', 'growing', 'ready', 'booked')
           group by lower(trim(crop_name)), unit
         )
         select dt.crop_name,
                dt.unit,
                dt.requested_quantity::float as requested_quantity,
                coalesce(st.available_quantity, 0)::float as available_quantity,
                greatest(dt.requested_quantity - coalesce(st.available_quantity, 0), 0)::float as gap_quantity,
                case
                  when coalesce(st.available_quantity, 0) >= dt.requested_quantity then 'Fully matched'
                  when coalesce(st.available_quantity, 0) > 0 then 'Partially matched'
                  else 'Unmet demand'
                end as status
         from demand_totals dt
         left join supply_totals st on st.crop_key = dt.crop_key and st.unit = dt.unit
         order by gap_quantity desc, requested_quantity desc
         limit 8`,
      ),
      getDb().query(
        `select to_char(date_trunc('month', expected_harvest_date), 'Mon YYYY') as harvest_month,
                crop_name,
                unit,
                coalesce(sum(quantity), 0)::float as projected_quantity,
                count(distinct farmer_id)::int as farmer_count
         from crop_supplies
         where status in ('planned', 'growing', 'ready', 'booked')
           and expected_harvest_date >= current_date
         group by date_trunc('month', expected_harvest_date), crop_name, unit
         order by date_trunc('month', expected_harvest_date), projected_quantity desc
         limit 8`,
      ),
    ]);

    return NextResponse.json(
      {
        summary: {
          users: usersResult.rows[0].count,
          supplies: suppliesResult.rows[0].count,
          demands: demandsResult.rows[0].count,
          bookings: bookingsResult.rows[0].count,
          demandSupplyGap: demandSupplyGapResult.rows,
          harvestProjection: harvestProjectionResult.rows,
        },
      },
      { status: 200, headers: PRIVATE_CACHE_HEADERS },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to load admin summary",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
