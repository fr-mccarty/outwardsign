-- Create dynamic_events table
-- Purpose: Instance of an event type with dynamic field_values JSON
-- Related: event_types, occasions
-- Note: Named dynamic_events to avoid conflict with any existing events table

CREATE TABLE dynamic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE RESTRICT,
  field_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE dynamic_events ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON dynamic_events TO anon;
GRANT ALL ON dynamic_events TO authenticated;
GRANT ALL ON dynamic_events TO service_role;

-- Indexes
CREATE INDEX idx_dynamic_events_parish_id ON dynamic_events(parish_id);
CREATE INDEX idx_dynamic_events_event_type_id ON dynamic_events(event_type_id);
CREATE INDEX idx_dynamic_events_field_values_gin ON dynamic_events USING GIN (field_values);

-- RLS Policies
-- Parish members can read events for their parish
CREATE POLICY dynamic_events_select_policy ON dynamic_events
  FOR SELECT
  USING (
    parish_id IN (
      SELECT parish_id
      FROM parish_users
      WHERE user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

-- Admin, Staff, and Ministry-Leader roles can create events
CREATE POLICY dynamic_events_insert_policy ON dynamic_events
  FOR INSERT
  WITH CHECK (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Admin, Staff, and Ministry-Leader roles can update events
CREATE POLICY dynamic_events_update_policy ON dynamic_events
  FOR UPDATE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Admin, Staff, and Ministry-Leader roles can delete events
CREATE POLICY dynamic_events_delete_policy ON dynamic_events
  FOR DELETE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER dynamic_events_updated_at
  BEFORE UPDATE ON dynamic_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comment explaining RESTRICT constraint on event_type_id
COMMENT ON TABLE dynamic_events IS 'Dynamic events table with JSONB field_values. ON DELETE RESTRICT for event_type_id prevents deletion of event types with existing events.';
