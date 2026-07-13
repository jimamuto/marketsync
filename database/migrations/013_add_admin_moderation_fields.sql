ALTER TABLE crop_supplies
  ADD COLUMN moderation_status VARCHAR(20) NOT NULL DEFAULT 'approved'
    CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN moderation_note TEXT,
  ADD COLUMN reviewed_by INT REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN reviewed_at TIMESTAMP;

ALTER TABLE demand_requests
  ADD COLUMN moderation_status VARCHAR(20) NOT NULL DEFAULT 'approved'
    CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN moderation_note TEXT,
  ADD COLUMN reviewed_by INT REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN reviewed_at TIMESTAMP;

CREATE INDEX idx_crop_supplies_moderation_status
  ON crop_supplies(moderation_status);

CREATE INDEX idx_demand_requests_moderation_status
  ON demand_requests(moderation_status);
