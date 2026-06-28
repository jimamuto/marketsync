CREATE INDEX IF NOT EXISTS idx_users_created_at
ON users(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crop_supplies_created_at
ON crop_supplies(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crop_supplies_farmer_created_at
ON crop_supplies(farmer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_demand_requests_created_at
ON demand_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_demand_requests_buyer_created_at
ON demand_requests(buyer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_created_at
ON bookings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_farmer_created_at
ON bookings(farmer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_buyer_created_at
ON bookings(buyer_id, created_at DESC);
