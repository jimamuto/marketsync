-- Demo users for MarketSync final presentation.
--
-- Safe local demo accounts created by this file:
--   Farmer:       farmer@marketsync.local
--   Buyer:        buyer@marketsync.local
--   Extra farmer: farmer2@marketsync.local
--   Extra buyer:  buyer2@marketsync.local
--
-- Demo password for all accounts: DemoPass123!
-- Password hash generated with bcryptjs.
-- Do not use these accounts or passwords in production.
--
-- This migration intentionally creates only demo users and credentials.
-- Showcase supplies, demands, bookings, and notifications live in the
-- separate demo-data migration so the demo dataset can be reset quickly.

INSERT INTO users (
  name,
  email,
  password_hash,
  role,
  phone,
  location,
  email_verified_at
)
VALUES
  (
    'Demo Farmer',
    'farmer@marketsync.local',
    '$2b$10$8XfU10MjRAb/Fu5svN4a6eAsbE5WfcaHptDHwMBljbIaSgieMUhKW',
    'farmer',
    '0700000001',
    'Kisumu',
    CURRENT_TIMESTAMP
  ),
  (
    'Demo Buyer',
    'buyer@marketsync.local',
    '$2b$10$8XfU10MjRAb/Fu5svN4a6eAsbE5WfcaHptDHwMBljbIaSgieMUhKW',
    'buyer',
    '0710000002',
    'Kisumu',
    CURRENT_TIMESTAMP
  ),
  (
    'Green Valley Farmer',
    'farmer2@marketsync.local',
    '$2b$10$8XfU10MjRAb/Fu5svN4a6eAsbE5WfcaHptDHwMBljbIaSgieMUhKW',
    'farmer',
    '0700000003',
    'Nakuru',
    CURRENT_TIMESTAMP
  ),
  (
    'Demo School Buyer',
    'buyer2@marketsync.local',
    '$2b$10$8XfU10MjRAb/Fu5svN4a6eAsbE5WfcaHptDHwMBljbIaSgieMUhKW',
    'buyer',
    '0710000004',
    'Nairobi',
    CURRENT_TIMESTAMP
  )
ON CONFLICT (email) DO UPDATE
SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  location = EXCLUDED.location,
  email_verified_at = EXCLUDED.email_verified_at,
  updated_at = CURRENT_TIMESTAMP;
