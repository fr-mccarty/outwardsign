-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  responsible_party_id UUID REFERENCES people(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  start_date DATE,
  start_time TIME,
  end_date DATE,
  end_time TIME,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  is_all_day BOOLEAN NOT NULL DEFAULT false,
  location TEXT,
  language TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_all_day_no_times CHECK (
    (is_all_day = false) OR
    (is_all_day = true AND start_time IS NULL AND end_time IS NULL)
  )
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users and anon role (used with JWT)
GRANT ALL ON events TO anon;
GRANT ALL ON events TO authenticated;
GRANT ALL ON events TO service_role;

-- Add indexes
CREATE INDEX idx_events_parish_id ON events(parish_id);
CREATE INDEX idx_events_responsible_party_id ON events(responsible_party_id);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_language ON events(language);

-- RLS Policies for events
-- Parish members can read events from their parish
CREATE POLICY "Parish members can read their parish events"
  ON events
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can insert events for their parish
CREATE POLICY "Parish members can create events for their parish"
  ON events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can update events from their parish
CREATE POLICY "Parish members can update their parish events"
  ON events
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can delete events from their parish
CREATE POLICY "Parish members can delete their parish events"
  ON events
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp on events
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
