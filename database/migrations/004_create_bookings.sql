CREATE TABLE bookings (
     id SERIAL PRIMARY KEY,
     supply_id INT NOT NULL REFERENCES crop_supplies(id) ON
 DELETE CASCADE,
     demand_request_id INT NOT NULL REFERENCES
 demand_requests(id) ON DELETE CASCADE,
     buyer_id INT NOT NULL REFERENCES users(id) ON DELETE
 CASCADE,
     farmer_id INT NOT NULL REFERENCES users(id) ON DELETE
 CASCADE,
     quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
     unit VARCHAR(20) NOT NULL,
     status VARCHAR(20) NOT NULL DEFAULT 'pending'
       CHECK (status IN ('pending', 'accepted', 'rejected',
 'cancelled', 'completed')),
     message TEXT,
     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
   );
