-- Create calendar_events table (formerly occasions)
-- Purpose: Calendar events - scheduled items that appear on calendar
--          Can be linked to master_events (rehearsal, ceremony) OR standalone (Zumba, Parish Picnic)
-- Related: master_events, locations

CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_event_id UUID REFERENCES master_events(id) ON DELETE CASCADE,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  date DATE,
  time TIME,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_standalone BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Constraint: master_event_id must be null if standalone, not null if not standalone
  CONSTRAINT calendar_events_standalone_check CHECK (
    (is_standalone = true AND master_event_id IS NULL) OR
    (is_standalone = false AND master_event_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON calendar_events TO anon;
GRANT ALL ON calendar_events TO authenticated;
GRANT ALL ON calendar_events TO service_role;

-- Indexes
CREATE INDEX idx_calendar_events_master_event_id ON calendar_events(master_event_id);
CREATE INDEX idx_calendar_events_parish_id ON calendar_events(parish_id);
CREATE INDEX idx_calendar_events_date ON calendar_events(master_event_id, date) WHERE deleted_at IS NULL;
CREATE INDEX idx_calendar_events_standalone ON calendar_events(parish_id)
  WHERE is_standalone = true AND deleted_at IS NULL;
CREATE UNIQUE INDEX idx_calendar_events_primary ON calendar_events(master_event_id)
  WHERE is_primary = true AND deleted_at IS NULL;

-- RLS Policies
-- Calendar events access depends on standalone vs linked
CREATE POLICY calendar_events_select_policy ON calendar_events
  FOR SELECT
  USING (
    -- Standalone events: check parish access
    (is_standalone = true AND parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    ))
    OR
    -- Linked events: check master event access
    (is_standalone = false AND master_event_id IN (
      SELECT e.id
      FROM master_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND e.deleted_at IS NULL
    ))
    AND deleted_at IS NULL
  );

-- Users who can create events can create calendar events
CREATE POLICY calendar_events_insert_policy ON calendar_events
  FOR INSERT
  WITH CHECK (
    -- Standalone events: check parish permission
    (is_standalone = true AND parish_id IN (
      SELECT pu.parish_id
      FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    ))
    OR
    -- Linked events: check master event permission
    (is_standalone = false AND master_event_id IN (
      SELECT e.id
      FROM master_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    ))
  );

-- Users who can update events can update calendar events
CREATE POLICY calendar_events_update_policy ON calendar_events
  FOR UPDATE
  USING (
    -- Same logic as select policy
    (is_standalone = true AND parish_id IN (
      SELECT pu.parish_id FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    ))
    OR
    (is_standalone = false AND master_event_id IN (
      SELECT e.id FROM master_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    ))
  );

-- Users who can delete events can delete calendar events
CREATE POLICY calendar_events_delete_policy ON calendar_events
  FOR DELETE
  USING (
    -- Same logic as update policy
    (is_standalone = true AND parish_id IN (
      SELECT pu.parish_id FROM parish_users pu
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    ))
    OR
    (is_standalone = false AND master_event_id IN (
      SELECT e.id FROM master_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    ))
  );

-- Comments
COMMENT ON TABLE calendar_events IS 'Calendar events - scheduled items that appear on calendar. Can be linked to master events or standalone.';
COMMENT ON COLUMN calendar_events.master_event_id IS 'Foreign key to master event (null for standalone events)';
COMMENT ON COLUMN calendar_events.parish_id IS 'Parish ID for access control (duplicated from master event for performance on linked events, required for standalone)';
COMMENT ON COLUMN calendar_events.is_standalone IS 'True if this is a standalone event (not linked to a master event)';
COMMENT ON INDEX idx_calendar_events_primary IS 'Ensures only one primary calendar event per master event. Partial unique index excludes deleted events.';
