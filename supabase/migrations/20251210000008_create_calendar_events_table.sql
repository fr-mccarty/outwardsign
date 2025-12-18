-- Create calendar_events table
-- Purpose: Calendar events - scheduled items that appear on parish calendar.
--          Every calendar_event must belong to a master_event (no standalone events).
-- Related: master_events, locations, input_field_definitions

CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  master_event_id UUID NOT NULL REFERENCES master_events(id) ON DELETE CASCADE,
  input_field_definition_id UUID NOT NULL REFERENCES input_field_definitions(id) ON DELETE RESTRICT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  is_all_day BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT calendar_events_end_after_start CHECK (end_datetime IS NULL OR end_datetime > start_datetime)
);

-- Enable RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON calendar_events TO anon;
GRANT ALL ON calendar_events TO authenticated;
GRANT ALL ON calendar_events TO service_role;

-- Indexes
CREATE INDEX idx_calendar_events_parish_id ON calendar_events(parish_id);
CREATE INDEX idx_calendar_events_master_event_id ON calendar_events(master_event_id);
CREATE INDEX idx_calendar_events_input_field_definition_id ON calendar_events(input_field_definition_id);
CREATE INDEX idx_calendar_events_start_datetime ON calendar_events(start_datetime) WHERE deleted_at IS NULL;
CREATE INDEX idx_calendar_events_location_id ON calendar_events(location_id);
CREATE INDEX idx_calendar_events_is_all_day ON calendar_events(is_all_day) WHERE deleted_at IS NULL;

-- Unique index to ensure only one calendar_event per master_event per field_definition
-- (Prevents duplicate "Rehearsal" entries for same wedding)
CREATE UNIQUE INDEX idx_calendar_events_unique_per_field
ON calendar_events(master_event_id, input_field_definition_id)
WHERE deleted_at IS NULL;

-- RLS Policies
CREATE POLICY calendar_events_select_policy ON calendar_events
  FOR SELECT
  USING (
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY calendar_events_insert_policy ON calendar_events
  FOR INSERT
  WITH CHECK (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

CREATE POLICY calendar_events_update_policy ON calendar_events
  FOR UPDATE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

CREATE POLICY calendar_events_delete_policy ON calendar_events
  FOR DELETE
  USING (
    parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Comments
COMMENT ON TABLE calendar_events IS 'Calendar events - scheduled items that appear on parish calendar. Every calendar_event must belong to a master_event.';
COMMENT ON COLUMN calendar_events.master_event_id IS 'Foreign key to master_events (NOT NULL - every calendar event must have a parent master event)';
COMMENT ON COLUMN calendar_events.input_field_definition_id IS 'References which field definition this calendar event corresponds to (e.g., Rehearsal field, Ceremony field)';
COMMENT ON COLUMN calendar_events.start_datetime IS 'Start date and time with timezone (TIMESTAMPTZ). For all-day events, should be midnight in parish timezone.';
COMMENT ON COLUMN calendar_events.end_datetime IS 'Optional end date and time (NULL for events without specific end time). For multi-day all-day events, this is the end date at midnight.';
COMMENT ON COLUMN calendar_events.is_primary IS 'True if this is the primary calendar event for the master event';
COMMENT ON COLUMN calendar_events.is_cancelled IS 'True if this specific calendar event is cancelled (master event may still be active)';
COMMENT ON COLUMN calendar_events.is_all_day IS 'True if this is an all-day event (no specific time, only date). For all-day events, start_datetime and end_datetime should be at midnight.';
