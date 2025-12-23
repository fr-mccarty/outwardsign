-- Create liturgical_calendar table (renamed from global_liturgical_events)
-- Stores liturgical calendar events fetched from https://litcal.johnromanodorazio.com
-- This is global data shared across all parishes
-- Parishes can create customized events in the separate liturgical_events table

CREATE TABLE IF NOT EXISTS liturgical_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Extracted fields for efficient querying
  event_key TEXT NOT NULL,
  date DATE NOT NULL,
  year INTEGER NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en_US',

  -- Full event data as JSON
  event_data JSONB NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate events (same event_key + date + locale)
  CONSTRAINT unique_liturgical_calendar_event UNIQUE (event_key, date, locale)
);

-- Index for primary query pattern: date range searches
CREATE INDEX idx_liturgical_calendar_date ON liturgical_calendar(date);

-- Index for year and locale filtering
CREATE INDEX idx_liturgical_calendar_year_locale ON liturgical_calendar(year, locale);

-- Index for event_key lookups
CREATE INDEX idx_liturgical_calendar_event_key ON liturgical_calendar(event_key);

-- GIN index for JSONB queries (if needed for searching within event_data)
CREATE INDEX idx_liturgical_calendar_event_data ON liturgical_calendar USING GIN (event_data);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_liturgical_calendar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_liturgical_calendar_updated_at
  BEFORE UPDATE ON liturgical_calendar
  FOR EACH ROW
  EXECUTE FUNCTION update_liturgical_calendar_updated_at();

-- Grant table-level permissions
-- anon and authenticated roles need SELECT permission on the table itself
GRANT SELECT ON liturgical_calendar TO anon;
GRANT SELECT ON liturgical_calendar TO authenticated;
GRANT ALL ON liturgical_calendar TO service_role;

-- RLS Policies
-- This is global read-only data, so we allow authenticated users to read
-- Only backend/admin operations can write

ALTER TABLE liturgical_calendar ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read liturgical calendar
CREATE POLICY "Anyone can read liturgical calendar"
  ON liturgical_calendar
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow anonymous users to read liturgical calendar (frontend uses anon role)
CREATE POLICY "Anonymous users can read liturgical calendar"
  ON liturgical_calendar
  FOR SELECT
  TO anon
  USING (true);

-- Only service role can insert/update/delete (backend operations only)
CREATE POLICY "Only service role can insert liturgical calendar"
  ON liturgical_calendar
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Only service role can update liturgical calendar"
  ON liturgical_calendar
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only service role can delete liturgical calendar"
  ON liturgical_calendar
  FOR DELETE
  TO service_role
  USING (true);

-- Comments
COMMENT ON TABLE liturgical_calendar IS 'Global liturgical calendar events from johnromanodorazio.com API, shared across all parishes';
COMMENT ON COLUMN liturgical_calendar.event_key IS 'Event identifier from the liturgical calendar API (e.g., "Advent1", "StFrancisXavier")';
COMMENT ON COLUMN liturgical_calendar.date IS 'Date of the liturgical event (extracted from event_data for indexing)';
COMMENT ON COLUMN liturgical_calendar.year IS 'Year of the event (extracted from event_data for filtering)';
COMMENT ON COLUMN liturgical_calendar.locale IS 'Language/locale code (e.g., "en_US", "es")';
COMMENT ON COLUMN liturgical_calendar.event_data IS 'Full event object from the API as JSONB';
