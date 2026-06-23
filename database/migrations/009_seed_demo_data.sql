-- Demo data for MarketSync final presentation.
--
-- Safe local demo accounts created by this file:
--   Farmer: farmer@marketsync.local
--   Buyer:  buyer@marketsync.local
--   Extra farmer: farmer2@marketsync.local
--   Extra buyer:  buyer2@marketsync.local
--
-- Demo password for all accounts: DemoPass123!
-- Password hash generated with bcryptjs.
-- Do not use these accounts or passwords in production.
--
-- This migration is idempotent: it uses email checks and natural demo-record
-- checks so it can be run more than once without duplicating demo rows.

WITH demo_users AS (
  INSERT INTO users (
    name,
    email,
    password_hash,
    role,
    phone,
    location,
    email_verified_at
  )
  VALUES
    (
      'Demo Farmer',
      'farmer@marketsync.local',
      '$2b$10$8XfU10MjRAb/Fu5svN4a6eAsbE5WfcaHptDHwMBljbIaSgieMUhKW',
      'farmer',
      '0700000001',
      'Kisumu',
      CURRENT_TIMESTAMP
    ),
    (
      'Demo Buyer',
      'buyer@marketsync.local',
      '$2b$10$8XfU10MjRAb/Fu5svN4a6eAsbE5WfcaHptDHwMBljbIaSgieMUhKW',
      'buyer',
      '0710000002',
      'Kisumu',
      CURRENT_TIMESTAMP
    ),
    (
      'Green Valley Farmer',
      'farmer2@marketsync.local',
      '$2b$10$8XfU10MjRAb/Fu5svN4a6eAsbE5WfcaHptDHwMBljbIaSgieMUhKW',
      'farmer',
      '0700000003',
      'Nakuru',
      CURRENT_TIMESTAMP
    ),
    (
      'Demo School Buyer',
      'buyer2@marketsync.local',
      '$2b$10$8XfU10MjRAb/Fu5svN4a6eAsbE5WfcaHptDHwMBljbIaSgieMUhKW',
      'buyer',
      '0710000004',
      'Nairobi',
      CURRENT_TIMESTAMP
    )
  ON CONFLICT (email) DO UPDATE
  SET
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    location = EXCLUDED.location,
    email_verified_at = EXCLUDED.email_verified_at,
    updated_at = CURRENT_TIMESTAMP
  RETURNING id, email
),
all_demo_users AS (
  SELECT id, email FROM demo_users
  UNION
  SELECT id, email
  FROM users
  WHERE email IN (
    'farmer@marketsync.local',
    'buyer@marketsync.local',
    'farmer2@marketsync.local',
    'buyer2@marketsync.local'
  )
),
demo_supplies AS (
  INSERT INTO crop_supplies (
    farmer_id,
    crop_name,
    crop_variety,
    quantity,
    unit,
    planting_date,
    expected_harvest_date,
    location,
    status
  )
  SELECT
    farmer.id,
    supply.crop_name,
    supply.crop_variety,
    supply.quantity,
    supply.unit,
    supply.planting_date,
    supply.expected_harvest_date,
    supply.location,
    supply.status
  FROM (
    VALUES
      (
        'farmer@marketsync.local',
        'Maize',
        'Yellow maize',
        100::numeric,
        'bags',
        DATE '2026-06-01',
        DATE '2026-08-15',
        'Kisumu',
        'ready'
      ),
      (
        'farmer@marketsync.local',
        'Maize',
        'White maize',
        80::numeric,
        'bags',
        DATE '2026-06-10',
        DATE '2026-08-18',
        'Kisumu',
        'growing'
      ),
      (
        'farmer2@marketsync.local',
        'Tomatoes',
        'Roma',
        300::numeric,
        'kgs',
        DATE '2026-06-05',
        DATE '2026-07-25',
        'Nakuru',
        'ready'
      ),
      (
        'farmer2@marketsync.local',
        'Beans',
        'Rosecoco',
        40::numeric,
        'bags',
        DATE '2026-06-15',
        DATE '2026-09-01',
        'Nakuru',
        'planned'
      )
  ) AS supply(
    farmer_email,
    crop_name,
    crop_variety,
    quantity,
    unit,
    planting_date,
    expected_harvest_date,
    location,
    status
  )
  JOIN all_demo_users farmer ON farmer.email = supply.farmer_email
  WHERE NOT EXISTS (
    SELECT 1
    FROM crop_supplies existing
    WHERE existing.farmer_id = farmer.id
      AND existing.crop_name = supply.crop_name
      AND COALESCE(existing.crop_variety, '') = COALESCE(supply.crop_variety, '')
      AND existing.location = supply.location
      AND existing.planting_date = supply.planting_date
      AND existing.expected_harvest_date = supply.expected_harvest_date
  )
  RETURNING id, crop_name, crop_variety, location, quantity, unit, farmer_id
),
all_demo_supplies AS (
  SELECT id, crop_name, crop_variety, location, quantity, unit, farmer_id
  FROM demo_supplies
  UNION
  SELECT cs.id, cs.crop_name, cs.crop_variety, cs.location, cs.quantity, cs.unit, cs.farmer_id
  FROM crop_supplies cs
  JOIN users u ON u.id = cs.farmer_id
  WHERE u.email IN ('farmer@marketsync.local', 'farmer2@marketsync.local')
    AND (
      (cs.crop_name = 'Maize' AND cs.location = 'Kisumu')
      OR (cs.crop_name = 'Tomatoes' AND cs.location = 'Nakuru')
      OR (cs.crop_name = 'Beans' AND cs.location = 'Nakuru')
    )
),
demo_demands AS (
  INSERT INTO demand_requests (
    buyer_id,
    crop_name,
    quantity,
    unit,
    required_date,
    location,
    notes,
    status
  )
  SELECT
    buyer.id,
    demand.crop_name,
    demand.quantity,
    demand.unit,
    demand.required_date,
    demand.location,
    demand.notes,
    demand.status
  FROM (
    VALUES
      (
        'buyer@marketsync.local',
        'Maize',
        50::numeric,
        'bags',
        DATE '2026-08-20',
        'Kisumu',
        'Match demo: should find Maize supplies in Kisumu.',
        'open'
      ),
      (
        'buyer@marketsync.local',
        'Tomatoes',
        200::numeric,
        'kgs',
        DATE '2026-07-28',
        'Nakuru',
        'Booking demo: should find tomato supply in Nakuru.',
        'booked'
      ),
      (
        'buyer2@marketsync.local',
        'Avocado',
        100::numeric,
        'kgs',
        DATE '2026-08-10',
        'Nairobi',
        'No-match demo: there is no matching avocado supply in Nairobi.',
        'open'
      )
  ) AS demand(
    buyer_email,
    crop_name,
    quantity,
    unit,
    required_date,
    location,
    notes,
    status
  )
  JOIN all_demo_users buyer ON buyer.email = demand.buyer_email
  WHERE NOT EXISTS (
    SELECT 1
    FROM demand_requests existing
    WHERE existing.buyer_id = buyer.id
      AND existing.crop_name = demand.crop_name
      AND existing.location = demand.location
      AND existing.required_date = demand.required_date
  )
  RETURNING id, buyer_id, crop_name, quantity, unit, location
),
all_demo_demands AS (
  SELECT id, buyer_id, crop_name, quantity, unit, location
  FROM demo_demands
  UNION
  SELECT dr.id, dr.buyer_id, dr.crop_name, dr.quantity, dr.unit, dr.location
  FROM demand_requests dr
  JOIN users u ON u.id = dr.buyer_id
  WHERE u.email IN ('buyer@marketsync.local', 'buyer2@marketsync.local')
    AND (
      (dr.crop_name = 'Maize' AND dr.location = 'Kisumu' AND dr.required_date = DATE '2026-08-20')
      OR (dr.crop_name = 'Tomatoes' AND dr.location = 'Nakuru' AND dr.required_date = DATE '2026-07-28')
      OR (dr.crop_name = 'Avocado' AND dr.location = 'Nairobi' AND dr.required_date = DATE '2026-08-10')
    )
)
INSERT INTO bookings (
  supply_id,
  demand_request_id,
  buyer_id,
  farmer_id,
  quantity,
  unit,
  status,
  message
)
SELECT
  supply.id,
  demand.id,
  demand.buyer_id,
  supply.farmer_id,
  150,
  'kgs',
  'pending',
  'Demo pending booking request for tomato supply.'
FROM all_demo_demands demand
JOIN all_demo_supplies supply
  ON supply.crop_name = demand.crop_name
 AND supply.location = demand.location
 AND supply.unit = demand.unit
WHERE demand.crop_name = 'Tomatoes'
  AND demand.location = 'Nakuru'
  AND NOT EXISTS (
    SELECT 1
    FROM bookings existing
    WHERE existing.supply_id = supply.id
      AND existing.demand_request_id = demand.id
  );
