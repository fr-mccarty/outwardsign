-- Create mass_role_blackout_dates table for tracking unavailability periods for people serving in mass roles
CREATE TABLE mass_role_blackout_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure end date is not before start date
  CHECK (end_date >= start_date)
);

-- Add comment documenting the purpose
COMMENT ON TABLE mass_role_blackout_dates IS 'Periods when people serving in mass roles are unavailable (vacations, travel, personal commitments)';
COMMENT ON COLUMN mass_role_blackout_dates.start_date IS 'First date of unavailability (inclusive)';
COMMENT ON COLUMN mass_role_blackout_dates.end_date IS 'Last date of unavailability (inclusive)';
COMMENT ON COLUMN mass_role_blackout_dates.reason IS 'Optional reason for unavailability (e.g., "Vacation", "Out of town", "Personal commitment")';

-- Enable RLS
ALTER TABLE mass_role_blackout_dates ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON mass_role_blackout_dates TO anon;
GRANT ALL ON mass_role_blackout_dates TO authenticated;
GRANT ALL ON mass_role_blackout_dates TO service_role;

-- Add indexes for performance
CREATE INDEX idx_mass_role_blackout_person ON mass_role_blackout_dates(person_id);
CREATE INDEX idx_mass_role_blackout_dates ON mass_role_blackout_dates(start_date, end_date);
CREATE INDEX idx_mass_role_blackout_start_date ON mass_role_blackout_dates(start_date);
CREATE INDEX idx_mass_role_blackout_end_date ON mass_role_blackout_dates(end_date);

-- RLS Policies for mass_role_blackout_dates

-- Parish members can read blackout dates for people in their parish
CREATE POLICY "Parish members can read blackout dates for their parish"
  ON mass_role_blackout_dates
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    person_id IN (
      SELECT p.id FROM people p
      JOIN parish_users pu ON p.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
    )
  );

-- Parish members can create blackout dates for people in their parish
CREATE POLICY "Parish members can create blackout dates for their parish"
  ON mass_role_blackout_dates
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    person_id IN (
      SELECT p.id FROM people p
      JOIN parish_users pu ON p.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
    )
  );

-- Parish members can update blackout dates for people in their parish
CREATE POLICY "Parish members can update blackout dates for their parish"
  ON mass_role_blackout_dates
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    person_id IN (
      SELECT p.id FROM people p
      JOIN parish_users pu ON p.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
    )
  );

-- Parish members can delete blackout dates for people in their parish
CREATE POLICY "Parish members can delete blackout dates for their parish"
  ON mass_role_blackout_dates
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    person_id IN (
      SELECT p.id FROM people p
      JOIN parish_users pu ON p.parish_id = pu.parish_id
      WHERE pu.user_id = auth.uid()
    )
  );
