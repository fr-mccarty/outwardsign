-- =====================================================
-- Mass Times Template Items Table
-- =====================================================
-- Purpose: Individual time slots within a Mass Time Template
-- Each item represents a specific Mass time (e.g., Saturday 5:00pm vigil, Sunday 10:00am)

-- Create day_type enum
DO $$ BEGIN
  CREATE TYPE day_type AS ENUM ('IS_DAY', 'DAY_BEFORE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add comment for the enum
COMMENT ON TYPE day_type IS 'Whether a Mass occurs on the actual day (IS_DAY) or the day before (DAY_BEFORE, e.g., Saturday 5pm vigil for Sunday)';

-- Create mass_times_template_items table
CREATE TABLE IF NOT EXISTS mass_times_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mass_times_template_id UUID NOT NULL REFERENCES mass_times_templates(id) ON DELETE CASCADE,

  -- Time configuration
  time TIME NOT NULL, -- e.g., "10:00:00", "17:00:00"
  day_type day_type NOT NULL DEFAULT 'IS_DAY',

  -- Default assignments for masses created from this template
  presider_id UUID REFERENCES people(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  length_of_time INTEGER, -- Duration in minutes
  homilist_id UUID REFERENCES people(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comments documenting the purpose
COMMENT ON TABLE mass_times_template_items IS 'Individual time slots within a Mass Time Template (e.g., Saturday 5:00pm vigil, Sunday 10:00am)';
COMMENT ON COLUMN mass_times_template_items.time IS 'The time of day for this Mass (e.g., 10:00:00, 17:00:00)';
COMMENT ON COLUMN mass_times_template_items.day_type IS 'IS_DAY = Mass occurs on the actual day (e.g., Sunday 10am), DAY_BEFORE = Mass occurs the day before (e.g., Saturday 5pm vigil for Sunday)';
COMMENT ON COLUMN mass_times_template_items.presider_id IS 'Default presider for masses created from this template item';
COMMENT ON COLUMN mass_times_template_items.location_id IS 'Default location for masses created from this template item';
COMMENT ON COLUMN mass_times_template_items.length_of_time IS 'Expected duration of the mass in minutes';
COMMENT ON COLUMN mass_times_template_items.homilist_id IS 'Default homilist for masses created from this template item';

-- Create indexes
CREATE INDEX idx_mass_times_template_items_template_id ON mass_times_template_items(mass_times_template_id);
CREATE INDEX idx_mass_times_template_items_time ON mass_times_template_items(time);
CREATE INDEX idx_mass_times_template_items_day_type ON mass_times_template_items(day_type);
CREATE INDEX idx_mass_times_template_items_presider_id ON mass_times_template_items(presider_id);
CREATE INDEX idx_mass_times_template_items_location_id ON mass_times_template_items(location_id);
CREATE INDEX idx_mass_times_template_items_homilist_id ON mass_times_template_items(homilist_id);

-- Enable RLS
ALTER TABLE mass_times_template_items ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON mass_times_template_items TO anon;
GRANT ALL ON mass_times_template_items TO authenticated;
GRANT ALL ON mass_times_template_items TO service_role;

-- RLS Policies
CREATE POLICY "mass_times_template_items_select"
  ON mass_times_template_items
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    mass_times_template_id IN (
      SELECT id FROM mass_times_templates WHERE parish_id IN (
        SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "mass_times_template_items_insert"
  ON mass_times_template_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    mass_times_template_id IN (
      SELECT id FROM mass_times_templates WHERE parish_id IN (
        SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "mass_times_template_items_update"
  ON mass_times_template_items
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    mass_times_template_id IN (
      SELECT id FROM mass_times_templates WHERE parish_id IN (
        SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "mass_times_template_items_delete"
  ON mass_times_template_items
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    mass_times_template_id IN (
      SELECT id FROM mass_times_templates WHERE parish_id IN (
        SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
      )
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_mass_times_template_items_updated_at
  BEFORE UPDATE ON mass_times_template_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
