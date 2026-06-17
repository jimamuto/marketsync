CREATE TABLE demand_requests (
     id SERIAL PRIMARY KEY,
     buyer_id INT NOT NULL REFERENCES users(id) ON DELETE
 CASCADE,
     crop_name VARCHAR(100) NOT NULL,
     quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
     unit VARCHAR(20) NOT NULL,
     required_date DATE NOT NULL,
     location VARCHAR(100) NOT NULL,
     notes TEXT,
     status VARCHAR(20) NOT NULL DEFAULT 'open'
       CHECK (status IN ('open', 'matched', 'booked',
 'cancelled', 'fulfilled')),
     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
   );
