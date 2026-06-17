CREATE INDEX idx_users_role ON users(role);
   CREATE INDEX idx_crop_supplies_farmer_id ON
 crop_supplies(farmer_id);
   CREATE INDEX idx_crop_supplies_crop_name ON
 crop_supplies(crop_name);
   CREATE INDEX idx_crop_supplies_location ON
 crop_supplies(location);
   CREATE INDEX idx_crop_supplies_expected_harvest_date ON
 crop_supplies(expected_harvest_date);
   CREATE INDEX idx_crop_supplies_status ON
 crop_supplies(status);

   CREATE INDEX idx_demand_requests_buyer_id ON
 demand_requests(buyer_id);
   CREATE INDEX idx_demand_requests_crop_name ON
 demand_requests(crop_name);
   CREATE INDEX idx_demand_requests_location ON
 demand_requests(location);
   CREATE INDEX idx_demand_requests_required_date ON
 demand_requests(required_date);
   CREATE INDEX idx_demand_requests_status ON
 demand_requests(status);

   CREATE INDEX idx_bookings_supply_id ON bookings(supply_id);
   CREATE INDEX idx_bookings_demand_request_id ON
 bookings(demand_request_id);
   CREATE INDEX idx_bookings_buyer_id ON bookings(buyer_id);
   CREATE INDEX idx_bookings_farmer_id ON bookings(farmer_id);
   CREATE INDEX idx_bookings_status ON bookings(status);
