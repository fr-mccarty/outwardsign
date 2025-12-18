-- Create master_event_roles table for role assignments
-- Purpose: Role assignments for master events
-- Related: master_events, event_types.role_definitions, people

CREATE TABLE master_event_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_event_id UUID NOT NULL REFERENCES master_events(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL,  -- References role from event_type.role_definitions JSONB
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE master_event_roles ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON master_event_roles TO anon;
GRANT ALL ON master_event_roles TO authenticated;
GRANT ALL ON master_event_roles TO service_role;

-- Indexes
CREATE INDEX idx_master_event_roles_master_event_id ON master_event_roles(master_event_id);
CREATE INDEX idx_master_event_roles_person_id ON master_event_roles(person_id);
CREATE INDEX idx_master_event_roles_role_id ON master_event_roles(master_event_id, role_id);

-- Unique index to prevent same person being assigned to same role twice for same event
CREATE UNIQUE INDEX idx_master_event_roles_unique_assignment
ON master_event_roles(master_event_id, role_id, person_id)
WHERE deleted_at IS NULL;

-- RLS Policies (inherit from master_events)
CREATE POLICY master_event_roles_select_policy ON master_event_roles
  FOR SELECT
  USING (
    master_event_id IN (
      SELECT e.id
      FROM master_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND e.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

CREATE POLICY master_event_roles_insert_policy ON master_event_roles
  FOR INSERT
  WITH CHECK (
    master_event_id IN (
      SELECT e.id
      FROM master_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
        AND e.deleted_at IS NULL
    )
  );

CREATE POLICY master_event_roles_update_policy ON master_event_roles
  FOR UPDATE
  USING (
    master_event_id IN (
      SELECT e.id
      FROM master_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
        AND e.deleted_at IS NULL
    )
  );

CREATE POLICY master_event_roles_delete_policy ON master_event_roles
  FOR DELETE
  USING (
    master_event_id IN (
      SELECT e.id
      FROM master_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
        AND e.deleted_at IS NULL
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER master_event_roles_updated_at
  BEFORE UPDATE ON master_event_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE master_event_roles IS 'Role assignments for master events. Role definitions come from event_type.role_definitions JSONB.';
COMMENT ON COLUMN master_event_roles.role_id IS 'Role identifier from event_type.role_definitions (e.g., "presider", "best-man", "lector1")';
COMMENT ON COLUMN master_event_roles.notes IS 'Optional notes (e.g., substitution information, special instructions)';
