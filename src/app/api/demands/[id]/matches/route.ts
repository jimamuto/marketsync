//finds matching crop supplies for specific buyer demand requests
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "../../../../../lib/database";
import { getSessionRole, getSessionUserId, hasBuyerAccess } from "../../../../../lib/session";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type DemandRow = {
  id: number;
  buyer_id: number;
  crop_name: string;
  quantity: number;
  unit: string;
  required_date: string;
  location: string;
  notes: string | null;
  status: string;
  moderation_status: "pending" | "approved" | "rejected";
  moderation_note: string | null;
};

type SupplyRow = {
  id: number;
  farmer_id: number;
  crop_name: string;
  crop_variety: string | null;
  quantity: number;
  unit: string;
  planting_date: string;
  expected_harvest_date: string;
  location: string;
  status: string;
  moderation_status: "pending" | "approved" | "rejected";
  moderation_note: string | null;
  created_at: string;
  updated_at: string;
};

function toDate(value: string) {//creates date object in UTC timezone
  return new Date(`${value}T00:00:00Z`);
}

function daysBetween(left: string, right: string) { //calculates difference between two days to be used for planting and harvest dates
  const diffMs = Math.abs(toDate(left).getTime() - toDate(right).getTime());
  return Math.round(diffMs / (1000 * 60 * 60 * 24)); //converts milliseconds to days
}
//Defines a function that gives a supply a match score against a demand request.
//performs the math
function scoreMatch(demand: DemandRow, supply: SupplyRow) {
  let score = 0;
  const reasons: string[] = [];

  if (supply.crop_name.toLowerCase() === demand.crop_name.toLowerCase()) {
    score += 40;
    reasons.push("crop name matches");
  }

  if (supply.location.toLowerCase() === demand.location.toLowerCase()) {
    score += 25;
    reasons.push("location matches");
  }

  if (supply.quantity >= demand.quantity) {
    score += 20;
    reasons.push("supply quantity covers demand");
  } else {
    score -= 30;
    reasons.push("supply quantity is lower than demand");
  }

  const harvestGap = daysBetween(supply.expected_harvest_date, demand.required_date);
  if (harvestGap <= 14) {
    score += 15;
    reasons.push("harvest date is close to required date");
  } else if (harvestGap <= 30) {
    score += 5;
    reasons.push("harvest date is somewhat close to required date");
  } else {
    score -= 10;
    reasons.push("harvest date is far from required date");
  }

  return {
    score,
    reasons,
    harvestGapDays: harvestGap,
  };
}
// fetch matches
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const userId = getSessionUserId(request);
    const role = getSessionRole(request);

    if (!userId || !hasBuyerAccess(role)) {
      return NextResponse.json(
        { message: "Only buyers can view matches for demand requests" },
        { status: 403 },
      );
    }

    const { id } = await context.params;
    const demandId = Number(id);

    if (!Number.isInteger(demandId) || demandId <= 0) {
      return NextResponse.json(
        { message: "Invalid demand id" },
        { status: 400 },
      );
    }

    const demandResult =
      role === "admin"
        ? await getDb().query<DemandRow>(
            `select id, buyer_id, crop_name, quantity, unit, required_date, location, notes, status,
                    moderation_status, moderation_note
             from demand_requests
             where id = $1`,
            [demandId],
          )
        : await getDb().query<DemandRow>(
            `select id, buyer_id, crop_name, quantity, unit, required_date, location, notes, status,
                    moderation_status, moderation_note
             from demand_requests
             where id = $1 and buyer_id = $2`,
            [demandId, userId],
          );

    if (demandResult.rowCount === 0) {
      return NextResponse.json(
        { message: "Demand request not found" },
        { status: 404 },
      );
    }

    const demand = demandResult.rows[0];

    const supplyResult = await getDb().query<SupplyRow>(
      `select id, farmer_id, crop_name, crop_variety, quantity, unit,
              planting_date, expected_harvest_date, location, status,
              moderation_status, moderation_note, created_at, updated_at
       from crop_supplies
       where moderation_status = 'approved'
         and lower(crop_name) = lower($1)
         and lower(location) = lower($2)
         and quantity >= $3
         and status in ('planned', 'growing', 'ready')
       order by expected_harvest_date asc, quantity desc, created_at desc`,
      [demand.crop_name, demand.location, demand.quantity],
    );
// Loops over every matching supply row and transforms it
    const matches = supplyResult.rows.map((supply) => {
      const match = scoreMatch(demand, supply);

      return {
        ...supply, //copies all supply fields into new object
        match_score: match.score,
        match_reasons: match.reasons,
        harvest_gap_days: match.harvestGapDays,
      };
    });

    matches.sort((left, right) => right.match_score - left.match_score); //sorts matches highest comes first

    return NextResponse.json(
      {
        demand,
        matches,
        match_count: matches.length,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch matches",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
