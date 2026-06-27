-- Showcase demo data for MarketSync final presentation.
--
-- Depends on:
--   009_seed_demo_data.sql for demo farmer/buyer users
--   010_create_notifications.sql for notification showcase rows
--
-- This migration intentionally keeps non-user demo records separate from
-- demo credentials so a fresh computer can be set up by running the numbered
-- migrations in order. It creates a richer scenario that maps to the
-- requirements tracker: planting cycles, crop calendar data, procurement
-- demands, matching examples, bookings, admin summaries, and booking
-- notifications.

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
    ('farmer@marketsync.local', 'Maize', 'Yellow maize', 160::numeric, 'bags', DATE '2026-05-10', DATE '2026-08-12', 'Kisumu', 'ready'),
    ('farmer@marketsync.local', 'Maize', 'White maize', 95::numeric, 'bags', DATE '2026-06-01', DATE '2026-08-25', 'Kisumu', 'growing'),
    ('farmer@marketsync.local', 'Sorghum', 'Serena', 70::numeric, 'bags', DATE '2026-06-18', DATE '2026-09-18', 'Kisumu', 'planned'),
    ('farmer@marketsync.local', 'Kales', 'Sukuma wiki', 450::numeric, 'kgs', DATE '2026-06-22', DATE '2026-07-20', 'Kisumu', 'ready'),
    ('farmer@marketsync.local', 'Beans', 'Mwitemania', 55::numeric, 'bags', DATE '2026-05-28', DATE '2026-08-05', 'Kakamega', 'booked'),
    ('farmer@marketsync.local', 'Onions', 'Red creole', 280::numeric, 'kgs', DATE '2026-06-11', DATE '2026-08-30', 'Kisumu', 'cancelled'),
    ('farmer2@marketsync.local', 'Tomatoes', 'Roma', 620::numeric, 'kgs', DATE '2026-05-15', DATE '2026-07-25', 'Nakuru', 'ready'),
    ('farmer2@marketsync.local', 'Potatoes', 'Shangi', 130::numeric, 'bags', DATE '2026-05-20', DATE '2026-08-10', 'Nakuru', 'ready'),
    ('farmer2@marketsync.local', 'Beans', 'Rosecoco', 80::numeric, 'bags', DATE '2026-06-15', DATE '2026-09-01', 'Nakuru', 'planned'),
    ('farmer2@marketsync.local', 'Carrots', 'Nantes', 350::numeric, 'kgs', DATE '2026-06-02', DATE '2026-08-02', 'Nakuru', 'growing'),
    ('farmer2@marketsync.local', 'Cabbage', 'Gloria F1', 400::numeric, 'heads', DATE '2026-06-05', DATE '2026-08-18', 'Nakuru', 'ready'),
    ('farmer2@marketsync.local', 'Tomatoes', 'Cherry', 180::numeric, 'kgs', DATE '2026-06-12', DATE '2026-08-05', 'Naivasha', 'growing')
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
JOIN users farmer ON farmer.email = supply.farmer_email
WHERE NOT EXISTS (
  SELECT 1
  FROM crop_supplies existing
  WHERE existing.farmer_id = farmer.id
    AND existing.crop_name = supply.crop_name
    AND COALESCE(existing.crop_variety, '') = COALESCE(supply.crop_variety, '')
    AND existing.location = supply.location
    AND existing.planting_date = supply.planting_date
    AND existing.expected_harvest_date = supply.expected_harvest_date
);

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
    ('buyer@marketsync.local', 'Maize', 120::numeric, 'bags', DATE '2026-08-20', 'Kisumu', 'School feeding programme needs dry maize delivered in 90kg bags.', 'matched'),
    ('buyer@marketsync.local', 'Tomatoes', 300::numeric, 'kgs', DATE '2026-07-28', 'Nakuru', 'Hotel kitchen order, tomatoes should be packed in 50kg crates.', 'booked'),
    ('buyer@marketsync.local', 'Beans', 45::numeric, 'bags', DATE '2026-08-08', 'Kakamega', 'County relief stock requires clean sorted beans.', 'booked'),
    ('buyer@marketsync.local', 'Kales', 250::numeric, 'kgs', DATE '2026-07-22', 'Kisumu', 'Hospital kitchen needs fresh leafy greens before morning delivery.', 'open'),
    ('buyer@marketsync.local', 'Potatoes', 60::numeric, 'bags', DATE '2026-08-12', 'Nakuru', 'Boarding school term opening order.', 'fulfilled'),
    ('buyer2@marketsync.local', 'Cabbage', 200::numeric, 'heads', DATE '2026-08-22', 'Nakuru', 'Institutional buyer needs uniform heads for cafeteria supply.', 'matched'),
    ('buyer2@marketsync.local', 'Carrots', 220::numeric, 'kgs', DATE '2026-08-04', 'Nakuru', 'Prefer washed and sorted carrots.', 'open'),
    ('buyer2@marketsync.local', 'Sorghum', 40::numeric, 'bags', DATE '2026-09-20', 'Kisumu', 'Milling partner request, useful for harvest projection demo.', 'open'),
    ('buyer2@marketsync.local', 'Avocado', 150::numeric, 'kgs', DATE '2026-08-10', 'Nairobi', 'No-match demo demand to show gap between demand and available supply.', 'open')
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
JOIN users buyer ON buyer.email = demand.buyer_email
WHERE NOT EXISTS (
  SELECT 1
  FROM demand_requests existing
  WHERE existing.buyer_id = buyer.id
    AND existing.crop_name = demand.crop_name
    AND existing.location = demand.location
    AND existing.required_date = demand.required_date
);

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
  booking.quantity,
  booking.unit,
  booking.status,
  booking.message
FROM (
  VALUES
    ('buyer@marketsync.local', 'farmer2@marketsync.local', 'Tomatoes', 'Roma', 'Nakuru', DATE '2026-07-28', 280::numeric, 'kgs', 'pending', 'Please confirm if the tomato order can be prepared by 27 July.'),
    ('buyer@marketsync.local', 'farmer@marketsync.local', 'Beans', 'Mwitemania', 'Kakamega', DATE '2026-08-08', 40::numeric, 'bags', 'accepted', 'Accepted demo booking for relief stock beans.'),
    ('buyer@marketsync.local', 'farmer2@marketsync.local', 'Potatoes', 'Shangi', 'Nakuru', DATE '2026-08-12', 55::numeric, 'bags', 'completed', 'Completed school supply booking.'),
    ('buyer2@marketsync.local', 'farmer2@marketsync.local', 'Cabbage', 'Gloria F1', 'Nakuru', DATE '2026-08-22', 180::numeric, 'heads', 'accepted', 'Accepted cafeteria cabbage order.'),
    ('buyer2@marketsync.local', 'farmer2@marketsync.local', 'Carrots', 'Nantes', 'Nakuru', DATE '2026-08-04', 180::numeric, 'kgs', 'rejected', 'Rejected because harvest quantity is reserved for another buyer.'),
    ('buyer@marketsync.local', 'farmer@marketsync.local', 'Maize', 'Yellow maize', 'Kisumu', DATE '2026-08-20', 100::numeric, 'bags', 'pending', 'Pending maize booking from matched Kisumu supply.')
) AS booking(
  buyer_email,
  farmer_email,
  crop_name,
  crop_variety,
  location,
  required_date,
  quantity,
  unit,
  status,
  message
)
JOIN users buyer ON buyer.email = booking.buyer_email
JOIN users farmer ON farmer.email = booking.farmer_email
JOIN demand_requests demand
  ON demand.buyer_id = buyer.id
 AND demand.crop_name = booking.crop_name
 AND demand.location = booking.location
 AND demand.required_date = booking.required_date
JOIN crop_supplies supply
  ON supply.farmer_id = farmer.id
 AND supply.crop_name = booking.crop_name
 AND COALESCE(supply.crop_variety, '') = COALESCE(booking.crop_variety, '')
 AND supply.location = booking.location
 AND supply.unit = booking.unit
WHERE NOT EXISTS (
  SELECT 1
  FROM bookings existing
  WHERE existing.supply_id = supply.id
    AND existing.demand_request_id = demand.id
);

INSERT INTO notifications (
  user_id,
  title,
  message,
  type,
  is_read,
  created_at
)
SELECT
  recipient.id,
  notification.title,
  notification.message,
  notification.type,
  notification.is_read,
  notification.created_at
FROM (
  VALUES
    ('farmer2@marketsync.local', 'New tomato booking request', 'Demo Buyer requested 280 kgs of Roma tomatoes for Nakuru delivery.', 'booking_created', FALSE, TIMESTAMP '2026-07-20 09:00:00'),
    ('farmer@marketsync.local', 'New maize booking request', 'Demo Buyer requested 100 bags of maize in Kisumu.', 'booking_created', FALSE, TIMESTAMP '2026-07-21 10:30:00'),
    ('buyer@marketsync.local', 'Beans booking accepted', 'Demo Farmer accepted the bean booking for Kakamega delivery.', 'booking_status', TRUE, TIMESTAMP '2026-07-18 14:15:00'),
    ('buyer2@marketsync.local', 'Carrot booking rejected', 'Green Valley Farmer rejected the carrot booking because the harvest is reserved.', 'booking_status', FALSE, TIMESTAMP '2026-07-19 16:45:00'),
    ('buyer2@marketsync.local', 'Cabbage booking accepted', 'Green Valley Farmer accepted your cabbage booking request.', 'booking_status', TRUE, TIMESTAMP '2026-07-17 11:20:00')
) AS notification(
  recipient_email,
  title,
  message,
  type,
  is_read,
  created_at
)
JOIN users recipient ON recipient.email = notification.recipient_email
WHERE NOT EXISTS (
  SELECT 1
  FROM notifications existing
  WHERE existing.user_id = recipient.id
    AND existing.title = notification.title
    AND existing.created_at = notification.created_at
);
