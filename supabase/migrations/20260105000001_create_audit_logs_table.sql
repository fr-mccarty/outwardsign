-- Create audit_logs table for field-level change tracking
-- This table stores full history of all changes to parish-scoped entities

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Entity identification
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,

  -- Operation type
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE', 'RESTORE')),

  -- Field-level changes
  -- Format: { "field_name": { "old": <value>, "new": <value> }, ... }
  changes JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Full record snapshots for rollback
  old_record JSONB,  -- NULL for INSERT
  new_record JSONB,  -- NULL for DELETE

  -- User tracking
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,  -- Denormalized for historical reference

  -- Context metadata
  source TEXT NOT NULL DEFAULT 'application' CHECK (source IN ('application', 'ai_chat', 'mcp', 'system', 'migration')),
  conversation_id UUID,  -- For AI chat traceability
  request_id TEXT,  -- Optional request correlation ID

  -- Restore tracking
  is_restore BOOLEAN NOT NULL DEFAULT false,
  restored_from_audit_id UUID REFERENCES audit_logs(id) ON DELETE SET NULL,

  -- Timestamps (no updated_at - audit logs are immutable)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_audit_logs_parish_id ON audit_logs(parish_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_operation ON audit_logs(operation);
CREATE INDEX idx_audit_logs_source ON audit_logs(source);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Composite index for entity history queries (most common pattern)
CREATE INDEX idx_audit_logs_entity_history ON audit_logs(table_name, record_id, created_at DESC);

-- Composite index for parish activity feed
CREATE INDEX idx_audit_logs_parish_activity ON audit_logs(parish_id, created_at DESC);

-- GIN index for JSONB field searches
CREATE INDEX idx_audit_logs_changes_gin ON audit_logs USING GIN (changes);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON audit_logs TO anon;
GRANT ALL ON audit_logs TO authenticated;
GRANT ALL ON audit_logs TO service_role;

-- RLS Policies

-- SELECT: Parish members can read audit logs for their parish
CREATE POLICY "Parish members can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    parish_id IN (
      SELECT parish_id
      FROM parish_users
      WHERE user_id = auth.uid()
      AND deleted_at IS NULL
    )
  );

-- INSERT: Only triggers and service_role can insert (via SECURITY DEFINER functions)
-- Regular users cannot directly insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- DELETE: Only admins can delete old audit logs (for cleanup/retention)
CREATE POLICY "Admins can delete audit logs"
  ON audit_logs
  FOR DELETE
  TO authenticated
  USING (
    parish_id IN (
      SELECT parish_id
      FROM parish_users
      WHERE user_id = auth.uid()
      AND 'admin' = ANY(roles)
      AND deleted_at IS NULL
    )
  );

-- No UPDATE policy - audit logs are immutable

-- Table comments
COMMENT ON TABLE audit_logs IS 'Field-level audit trail for all entity changes. Tracks who changed what, when, with before/after values.';
COMMENT ON COLUMN audit_logs.changes IS 'JSONB object of changed fields: { "field_name": { "old": value, "new": value }, ... }';
COMMENT ON COLUMN audit_logs.old_record IS 'Complete record snapshot before change (NULL for INSERT)';
COMMENT ON COLUMN audit_logs.new_record IS 'Complete record snapshot after change (NULL for DELETE)';
COMMENT ON COLUMN audit_logs.source IS 'Origin of the change: application, ai_chat, mcp, system, or migration';
COMMENT ON COLUMN audit_logs.is_restore IS 'True if this entry represents a restore operation';
COMMENT ON COLUMN audit_logs.restored_from_audit_id IS 'If is_restore=true, references the audit entry we restored to';
