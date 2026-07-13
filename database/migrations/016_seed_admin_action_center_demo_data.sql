-- Presentation data for the admin Action Center.
-- Safe to run repeatedly: each record is identified by its owner and demo name.

INSERT INTO crop_supplies (
  farmer_id,
  crop_name,
  crop_variety,
  quantity,
  unit,
  planting_date,
  expected_harvest_date,
  location,
  status,
  moderation_status
)
SELECT
  farmer.id,
  seed.crop_name,
  seed.crop_variety,
  seed.quantity,
  seed.unit,
  CURRENT_DATE - seed.planted_days,
  CURRENT_DATE + seed.harvest_offset_days,
  seed.location,
  seed.status,
  seed.moderation_status
FROM (
  VALUES
    ('Admin Review Tomatoes', 'Roma', 220::numeric, 'kgs', 35, 14, 'Kisumu', 'growing', 'pending'),
    ('Admin Review Beans', 'Rosecoco', 80::numeric, 'bags', 50, 30, 'Nakuru', 'planned', 'pending'),
    ('Overdue Admin Kales', 'Sukuma wiki', 150::numeric, 'kgs', 70, -2, 'Kisumu', 'ready', 'approved')
) AS seed(
  crop_name,
  crop_variety,
  quantity,
  unit,
  planted_days,
  harvest_offset_days,
  location,
  status,
  moderation_status
)
JOIN users farmer ON farmer.email = 'farmer@marketsync.local'
WHERE NOT EXISTS (
  SELECT 1
  FROM crop_supplies existing
  WHERE existing.farmer_id = farmer.id
    AND existing.crop_name = seed.crop_name
);

INSERT INTO demand_requests (
  buyer_id,
  crop_name,
  quantity,
  unit,
  required_date,
  location,
  notes,
  status,
  moderation_status
)
SELECT
  buyer.id,
  seed.crop_name,
  seed.quantity,
  seed.unit,
  CURRENT_DATE + seed.required_offset_days,
  seed.location,
  seed.notes,
  'open',
  'pending'
FROM (
  VALUES
    ('Admin Review Avocado', 300::numeric, 'kgs', 30, 'Nairobi', 'Presentation demand awaiting admin quality review.'),
    ('Admin Review Onions', 120::numeric, 'kgs', 45, 'Kisumu', 'Presentation demand awaiting admin quality review.')
) AS seed(
  crop_name,
  quantity,
  unit,
  required_offset_days,
  location,
  notes
)
JOIN users buyer ON buyer.email = 'buyer@marketsync.local'
WHERE NOT EXISTS (
  SELECT 1
  FROM demand_requests existing
  WHERE existing.buyer_id = buyer.id
    AND existing.crop_name = seed.crop_name
    AND existing.location = seed.location
);
