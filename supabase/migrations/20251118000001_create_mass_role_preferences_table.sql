-- Create mass_role_preferences table for storing availability and preferences for people serving in mass roles
CREATE TABLE mass_role_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  mass_role_id UUID REFERENCES mass_roles(id) ON DELETE CASCADE,

  -- Day/Time preferences
  preferred_days JSONB, -- ["SUNDAY", "SATURDAY"]
  available_days JSONB, -- ["MONDAY", "WEDNESDAY"]
  unavailable_days JSONB, -- ["FRIDAY"]
  preferred_times JSONB, -- ["09:00-12:00", "17:00-19:00"]
  unavailable_times JSONB, -- ["06:00-08:00"]

  -- Frequency preferences
  desired_frequency TEXT, -- 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'OCCASIONAL'
  max_per_month INTEGER,

  -- Language capabilities
  languages JSONB, -- [{"language": "en", "level": "fluent"}, {"language": "es", "level": "intermediate"}]

  -- Special notes
  notes TEXT,

  -- Active status
  active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Each person can have one preference record per role per parish
  UNIQUE(person_id, parish_id, mass_role_id)
);

-- Add comment documenting the purpose
COMMENT ON TABLE mass_role_preferences IS 'Availability preferences and scheduling constraints for people serving in liturgical mass roles';
COMMENT ON COLUMN mass_role_preferences.preferred_days IS 'Days of week person prefers to serve (e.g., ["SUNDAY", "SATURDAY"])';
COMMENT ON COLUMN mass_role_preferences.available_days IS 'Days of week person is available (willing but not preferred)';
COMMENT ON COLUMN mass_role_preferences.unavailable_days IS 'Days of week person is not available';
COMMENT ON COLUMN mass_role_preferences.preferred_times IS 'Time ranges person prefers (e.g., ["09:00-12:00"])';
COMMENT ON COLUMN mass_role_preferences.unavailable_times IS 'Time ranges person is not available';
COMMENT ON COLUMN mass_role_preferences.desired_frequency IS 'How often person wants to serve: WEEKLY, BIWEEKLY, MONTHLY, or OCCASIONAL';
COMMENT ON COLUMN mass_role_preferences.max_per_month IS 'Maximum number of assignments per month';
COMMENT ON COLUMN mass_role_preferences.languages IS 'Language capabilities with proficiency levels';

-- Enable RLS
ALTER TABLE mass_role_preferences ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON mass_role_preferences TO anon;
GRANT ALL ON mass_role_preferences TO authenticated;
GRANT ALL ON mass_role_preferences TO service_role;

-- Add indexes for performance
CREATE INDEX idx_mass_role_prefs_person ON mass_role_preferences(person_id);
CREATE INDEX idx_mass_role_prefs_parish ON mass_role_preferences(parish_id);
CREATE INDEX idx_mass_role_prefs_role ON mass_role_preferences(mass_role_id);
CREATE INDEX idx_mass_role_prefs_active ON mass_role_preferences(active);

-- RLS Policies for mass_role_preferences

-- Parish members can read preferences for their parish
CREATE POLICY "Parish members can read their parish mass role preferences"
  ON mass_role_preferences
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can create preferences for their parish
CREATE POLICY "Parish members can create mass role preferences"
  ON mass_role_preferences
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can update preferences for their parish
CREATE POLICY "Parish members can update mass role preferences"
  ON mass_role_preferences
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can delete preferences for their parish
CREATE POLICY "Parish members can delete mass role preferences"
  ON mass_role_preferences
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_mass_role_preferences_updated_at
  BEFORE UPDATE ON mass_role_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
