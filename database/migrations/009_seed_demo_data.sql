WITH demo_farmer AS (
  INSERT INTO users (
    name,
    email,
    password_hash,
    role,
    phone,
    location,
    email_verified_at
  )
  VALUES (
    'Demo Farmer',
    'farmer@marketsync.local',
    '$2b$10$fp3r07i/6E5DDquxfWjTU.KkOUdSqVEj3H5465w6h1H8BelDKCOOW',
    'farmer',
    '0700000001',
    'Kisumu',
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
  RETURNING id
),
demo_buyer AS (
  INSERT INTO users (
    name,
    email,
    password_hash,
    role,
    phone,
    location,
    email_verified_at
  )
  VALUES (
    'Demo Buyer',
    'buyer@marketsync.local',
    '$2b$10$fp3r07i/6E5DDquxfWjTU.KkOUdSqVEj3H5465w6h1H8BelDKCOOW',
    'buyer',
    '0710000002',
    'Kisumu',
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
  RETURNING id
)
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
  demo_farmer.id,
  'Maize',
  'Yellow maize',
  100,
  'bags',
  DATE '2026-06-01',
  DATE '2026-08-15',
  'Kisumu',
  'ready'
FROM demo_farmer
WHERE NOT EXISTS (
  SELECT 1
  FROM crop_supplies
  WHERE crop_name = 'Maize'
    AND crop_variety = 'Yellow maize'
    AND location = 'Kisumu'
    AND planting_date = DATE '2026-06-01'
    AND expected_harvest_date = DATE '2026-08-15'
);

WITH demo_buyer AS (
  SELECT id FROM users WHERE email = 'buyer@marketsync.local' LIMIT 1
)
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
  demo_buyer.id,
  'Maize',
  50,
  'bags',
  DATE '2026-08-20',
  'Kisumu',
  'Demo demand request for presentation',
  'open'
FROM demo_buyer
WHERE NOT EXISTS (
  SELECT 1
  FROM demand_requests
  WHERE crop_name = 'Maize'
    AND location = 'Kisumu'
    AND required_date = DATE '2026-08-20'
);
