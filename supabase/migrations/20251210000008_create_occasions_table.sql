-- Create occasions table
-- Purpose: Date/time/location entries attached to an event
-- Related: dynamic_events, locations

CREATE TABLE occasions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES dynamic_events(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  date DATE,
  time TIME,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE occasions ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON occasions TO anon;
GRANT ALL ON occasions TO authenticated;
GRANT ALL ON occasions TO service_role;

-- Indexes
CREATE INDEX idx_occasions_event_id ON occasions(event_id);
CREATE INDEX idx_occasions_date ON occasions(event_id, date) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_occasions_primary ON occasions(event_id)
  WHERE is_primary = true AND deleted_at IS NULL;

-- RLS Policies
-- Occasions inherit access from parent event
-- Users with event access can read occasions
CREATE POLICY occasions_select_policy ON occasions
  FOR SELECT
  USING (
    event_id IN (
      SELECT e.id
      FROM dynamic_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND e.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- Users who can create events can create occasions
CREATE POLICY occasions_insert_policy ON occasions
  FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT e.id
      FROM dynamic_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Users who can update events can update occasions
CREATE POLICY occasions_update_policy ON occasions
  FOR UPDATE
  USING (
    event_id IN (
      SELECT e.id
      FROM dynamic_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Users who can delete events can delete occasions
CREATE POLICY occasions_delete_policy ON occasions
  FOR DELETE
  USING (
    event_id IN (
      SELECT e.id
      FROM dynamic_events e
      JOIN parish_users pu ON e.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
        AND (pu.roles && ARRAY['admin', 'staff', 'ministry-leader'])
    )
  );

-- Comment explaining unique constraint on is_primary
COMMENT ON INDEX idx_occasions_primary IS 'Ensures only one primary occasion per event. Partial unique index excludes deleted occasions.';
