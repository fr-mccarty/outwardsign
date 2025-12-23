-- Create master_events table (formerly dynamic_events)
-- Purpose: Master event containers for sacraments (Weddings, Funerals, etc.)
--          Stores dynamic field_values JSON and manual minister assignment
-- Related: event_types, calendar_events, liturgical_calendar

CREATE TABLE master_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE RESTRICT,
  liturgical_calendar_id UUID REFERENCES liturgical_calendar(id) ON DELETE SET NULL,
  field_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE master_events ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON master_events TO anon;
GRANT ALL ON master_events TO authenticated;
GRANT ALL ON master_events TO service_role;

-- Indexes
CREATE INDEX idx_master_events_parish_id ON master_events(parish_id);
CREATE INDEX idx_master_events_event_type_id ON master_events(event_type_id);
CREATE INDEX idx_master_events_liturgical_calendar_id ON master_events(liturgical_calendar_id);
CREATE INDEX idx_master_events_field_values_gin ON master_events USING GIN (field_values);
CREATE INDEX idx_master_events_status ON master_events(status);

-- RLS Policies
-- Parish members can read events for their parish
CREATE POLICY master_events_select_policy ON master_events
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
CREATE POLICY master_events_insert_policy ON master_events
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
CREATE POLICY master_events_update_policy ON master_events
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
CREATE POLICY master_events_delete_policy ON master_events
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
CREATE TRIGGER master_events_updated_at
  BEFORE UPDATE ON master_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE master_events IS 'Master events (sacrament containers) with JSONB field_values. ON DELETE RESTRICT for event_type_id prevents deletion of event types with existing events.';
COMMENT ON COLUMN master_events.liturgical_calendar_id IS 'Optional link to liturgical_calendar for events tied to a specific liturgical day (e.g., Christmas Mass, Easter Vigil). ON DELETE SET NULL preserves the event if the calendar entry is removed.';
COMMENT ON COLUMN master_events.status IS 'Event status (values defined in application constants)';
