INSERT INTO users (
  name,
  email,
  password_hash,
  role,
  phone,
  location
) VALUES 
(    
     'System Admin',
     'admin@marketsync.local',
     '$2b$10$Lgwufl2Brbu/Wv/jgBVs4.dGt5JRIQ.D12k58Kchjs/e5aS1r1f1S',
     'admin',
     NULL,
     NULL
   )
   ON CONFLICT (email) DO UPDATE
   SET
     name = EXCLUDED.name,
     password_hash = EXCLUDED.password_hash,
     role = EXCLUDED.role,
     phone = EXCLUDED.phone,
     location = EXCLUDED.location,
     updated_at = CURRENT_TIMESTAMP;
