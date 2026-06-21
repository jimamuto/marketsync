ALTER TABLE users
   ADD COLUMN email_verified_at TIMESTAMP;

   CREATE TABLE email_verification_tokens (
     id SERIAL PRIMARY KEY,
     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     token TEXT NOT NULL UNIQUE,
     expires_at TIMESTAMP NOT NULL,
     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
