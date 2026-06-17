CREATE TABLE crop_supplies (
     id SERIAL PRIMARY KEY,
     farmer_id INT NOT NULL REFERENCES users(id) ON DELETE
 CASCADE,
     crop_name VARCHAR(100) NOT NULL,
     crop_variety VARCHAR(100),
     quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
     unit VARCHAR(20) NOT NULL,
     planting_date DATE NOT NULL,
     expected_harvest_date DATE NOT NULL,
     location VARCHAR(100) NOT NULL,
     status VARCHAR(20) NOT NULL DEFAULT 'planned'
       CHECK (status IN ('planned', 'growing', 'ready',
 'booked', 'cancelled')),
     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     CHECK (expected_harvest_date >= planting_date)
   );
