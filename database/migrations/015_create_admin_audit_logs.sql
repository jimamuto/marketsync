CREATE TABLE admin_audit_logs (
  id SERIAL PRIMARY KEY,
  admin_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(40) NOT NULL,
  entity_id INT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_audit_logs_created_at
  ON admin_audit_logs(created_at DESC);

CREATE INDEX idx_admin_audit_logs_entity
  ON admin_audit_logs(entity_type, entity_id);
