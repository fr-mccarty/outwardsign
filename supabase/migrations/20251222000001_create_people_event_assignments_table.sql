-- Create people_event_assignments table
-- Purpose: Unified storage for all person-to-event assignments
-- Related: master_events, calendar_events, input_field_definitions, people

CREATE TABLE people_event_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event context (two-level pattern)
  master_event_id UUID NOT NULL REFERENCES master_events(id) ON DELETE CASCADE,
  calendar_event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,

  -- Assignment details
  field_definition_id UUID NOT NULL REFERENCES input_field_definitions(id) ON DELETE RESTRICT,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE RESTRICT,

  -- Optional notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE people_event_assignments ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON people_event_assignments TO anon;
GRANT ALL ON people_event_assignments TO authenticated;
GRANT ALL ON people_event_assignments TO service_role;

-- Indexes
CREATE INDEX idx_people_event_assignments_master_event_id
  ON people_event_assignments(master_event_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_people_event_assignments_calendar_event_id
  ON people_event_assignments(calendar_event_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_people_event_assignments_person_id
  ON people_event_assignments(person_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_people_event_assignments_field_definition_id
  ON people_event_assignments(field_definition_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_people_event_assignments_person_master_calendar
  ON people_event_assignments(person_id, master_event_id, calendar_event_id)
  WHERE deleted_at IS NULL;

-- Unique constraint: one person per role per event/occurrence
CREATE UNIQUE INDEX idx_people_event_assignments_unique
ON people_event_assignments(
  master_event_id,
  COALESCE(calendar_event_id, '00000000-0000-0000-0000-000000000000'::uuid),
  field_definition_id,
  person_id
)
WHERE deleted_at IS NULL;

-- RLS Policies
CREATE POLICY people_event_assignments_select_policy ON people_event_assignments
  FOR SELECT
  USING (
    master_event_id IN (
      SELECT me.id
      FROM master_events me
      JOIN parish_users pu ON me.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND me.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

CREATE POLICY people_event_assignments_insert_policy ON people_event_assignments
  FOR INSERT
  WITH CHECK (
    master_event_id IN (
      SELECT me.id
      FROM master_events me
      JOIN parish_users pu ON me.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
        AND me.deleted_at IS NULL
    )
  );

CREATE POLICY people_event_assignments_update_policy ON people_event_assignments
  FOR UPDATE
  USING (
    master_event_id IN (
      SELECT me.id
      FROM master_events me
      JOIN parish_users pu ON me.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
        AND me.deleted_at IS NULL
    )
  );

CREATE POLICY people_event_assignments_delete_policy ON people_event_assignments
  FOR DELETE
  USING (
    master_event_id IN (
      SELECT me.id
      FROM master_events me
      JOIN parish_users pu ON me.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
        AND me.deleted_at IS NULL
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER people_event_assignments_updated_at
  BEFORE UPDATE ON people_event_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE people_event_assignments IS 'Unified storage for all person-to-event assignments. calendar_event_id NULL = template-level (applies to all occurrences), populated = occurrence-level (specific to one calendar event).';
COMMENT ON COLUMN people_event_assignments.calendar_event_id IS 'NULL for template-level assignments (bride, groom, presider), populated for occurrence-level assignments (lector at Saturday 5pm Mass)';
COMMENT ON COLUMN people_event_assignments.field_definition_id IS 'References which role/field this assignment is for (defined in input_field_definitions)';
COMMENT ON COLUMN people_event_assignments.notes IS 'Optional notes (e.g., "substitute for John Doe", "playing piano")';
