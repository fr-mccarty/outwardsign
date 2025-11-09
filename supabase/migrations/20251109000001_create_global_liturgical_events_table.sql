-- Create global_liturgical_events table
-- Stores liturgical calendar events fetched from https://litcal.johnromanodorazio.com
-- This is global data shared across all parishes
-- Parishes can create customized events in the separate liturgical_events table

CREATE TABLE IF NOT EXISTS global_liturgical_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Extracted fields for efficient querying
  event_key TEXT NOT NULL,
  date DATE NOT NULL,
  year INTEGER NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',

  -- Full event data as JSON
  event_data JSONB NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate events (same event_key + date + locale)
  CONSTRAINT unique_global_liturgical_event UNIQUE (event_key, date, locale)
);

-- Index for primary query pattern: date range searches
CREATE INDEX idx_global_liturgical_events_date ON global_liturgical_events(date);

-- Index for year and locale filtering
CREATE INDEX idx_global_liturgical_events_year_locale ON global_liturgical_events(year, locale);

-- Index for event_key lookups
CREATE INDEX idx_global_liturgical_events_event_key ON global_liturgical_events(event_key);

-- GIN index for JSONB queries (if needed for searching within event_data)
CREATE INDEX idx_global_liturgical_events_event_data ON global_liturgical_events USING GIN (event_data);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_global_liturgical_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_global_liturgical_events_updated_at
  BEFORE UPDATE ON global_liturgical_events
  FOR EACH ROW
  EXECUTE FUNCTION update_global_liturgical_events_updated_at();

-- RLS Policies
-- This is global read-only data, so we allow authenticated users to read
-- Only backend/admin operations can write

ALTER TABLE global_liturgical_events ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read global liturgical events
CREATE POLICY "Anyone can read global liturgical events"
  ON global_liturgical_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update/delete (backend operations only)
CREATE POLICY "Only service role can insert global liturgical events"
  ON global_liturgical_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Only service role can update global liturgical events"
  ON global_liturgical_events
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only service role can delete global liturgical events"
  ON global_liturgical_events
  FOR DELETE
  TO service_role
  USING (true);

-- Comments
COMMENT ON TABLE global_liturgical_events IS 'Global liturgical calendar events from johnromanodorazio.com API, shared across all parishes';
COMMENT ON COLUMN global_liturgical_events.event_key IS 'Event identifier from the liturgical calendar API (e.g., "Advent1", "StFrancisXavier")';
COMMENT ON COLUMN global_liturgical_events.date IS 'Date of the liturgical event (extracted from event_data for indexing)';
COMMENT ON COLUMN global_liturgical_events.year IS 'Year of the event (extracted from event_data for filtering)';
COMMENT ON COLUMN global_liturgical_events.locale IS 'Language/locale code (e.g., "en", "es")';
COMMENT ON COLUMN global_liturgical_events.event_data IS 'Full event object from the API as JSONB';
