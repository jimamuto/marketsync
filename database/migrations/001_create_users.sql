 CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(150) NOT NULL UNIQUE,
     password_hash TEXT NOT NULL,
     role VARCHAR(20) NOT NULL CHECK (role IN ('farmer',
 'buyer', 'admin')),
     phone VARCHAR(30),
     location VARCHAR(100),
     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
   );
