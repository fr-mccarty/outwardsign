-- =====================================================
-- Mass Times Template Items Table
-- =====================================================
-- Purpose: Individual time slots within a Mass Time Template
-- Each item represents a specific Mass time (e.g., Saturday 5:00pm vigil, Sunday 10:00am)
--
-- DATA MODEL CONTEXT:
-- The mass scheduling system has three levels:
--   Level 1: Mass Type (event_types + input_field_definitions) - WHAT roles exist
--   Level 2: Mass Schedule (this table) - WHEN masses occur, HOW MANY of each role
--   Level 3: Individual Mass (master_events + people_event_assignments) - WHO is assigned
--
-- This table (Level 2) defines:
--   - role_quantities: How many of each role are needed (e.g., {lector: 2, emhc: 4})
--   - default_assignments: Default people for roles (e.g., {presider: "uuid", lector: ["uuid1", null]})
--
-- Automation tools use this to generate mass instances:
--   1. Read role_quantities to know how many slots to fill
--   2. Use default_assignments as starting point
--   3. Fill remaining slots from availability pool

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
  event_type_id UUID REFERENCES event_types(id) ON DELETE SET NULL,

  -- Time configuration
  time TIME NOT NULL, -- e.g., "10:00:00", "17:00:00"
  day_type day_type NOT NULL DEFAULT 'IS_DAY',

  -- Default settings for masses created from this template
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  length_of_time INTEGER, -- Duration in minutes

  -- Role configuration (used by automation tools)
  role_quantities JSONB NOT NULL DEFAULT '{}'::jsonb,
  default_assignments JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comments documenting the purpose
COMMENT ON TABLE mass_times_template_items IS 'Individual time slots within a Mass Time Template (e.g., Saturday 5:00pm vigil, Sunday 10:00am). Part of Level 2 (Mass Schedule) in the three-level mass scheduling system.';
COMMENT ON COLUMN mass_times_template_items.time IS 'The time of day for this Mass (e.g., 10:00:00, 17:00:00)';
COMMENT ON COLUMN mass_times_template_items.day_type IS 'IS_DAY = Mass occurs on the actual day (e.g., Sunday 10am), DAY_BEFORE = Mass occurs the day before (e.g., Saturday 5pm vigil for Sunday)';
COMMENT ON COLUMN mass_times_template_items.location_id IS 'Default location for masses created from this template item';
COMMENT ON COLUMN mass_times_template_items.length_of_time IS 'Expected duration of the mass in minutes';
COMMENT ON COLUMN mass_times_template_items.event_type_id IS 'Links to the event type that defines available roles (Level 1). The role_quantities and default_assignments keys should match input_field_definitions.property_name for this event type.';
COMMENT ON COLUMN mass_times_template_items.role_quantities IS 'JSONB object defining HOW MANY people are needed for each role. Keys must match input_field_definitions.property_name. Example: {"presider": 1, "lector": 2, "emhc": 4, "usher": 6}';
COMMENT ON COLUMN mass_times_template_items.default_assignments IS 'JSONB object defining default WHO for each role. For roles with quantity=1, use a UUID string. For quantity>1, use an array (null = open slot). Keys must match input_field_definitions.property_name. Example: {"presider": "fr-smith-uuid", "lector": ["maria-uuid", null]}';

-- Create indexes
CREATE INDEX idx_mass_times_template_items_template_id ON mass_times_template_items(mass_times_template_id);
CREATE INDEX idx_mass_times_template_items_time ON mass_times_template_items(time);
CREATE INDEX idx_mass_times_template_items_day_type ON mass_times_template_items(day_type);
CREATE INDEX idx_mass_times_template_items_location_id ON mass_times_template_items(location_id);
CREATE INDEX idx_mass_times_template_items_event_type_id ON mass_times_template_items(event_type_id);
CREATE INDEX idx_mass_times_template_items_role_quantities_gin ON mass_times_template_items USING GIN (role_quantities);
CREATE INDEX idx_mass_times_template_items_default_assignments_gin ON mass_times_template_items USING GIN (default_assignments);

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
