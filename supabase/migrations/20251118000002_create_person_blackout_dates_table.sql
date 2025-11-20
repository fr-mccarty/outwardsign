-- Create person_blackout_dates table for tracking unavailability periods for people
CREATE TABLE person_blackout_dates (
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
COMMENT ON TABLE person_blackout_dates IS 'Periods when people are unavailable (vacations, travel, personal commitments)';
COMMENT ON COLUMN person_blackout_dates.start_date IS 'First date of unavailability (inclusive)';
COMMENT ON COLUMN person_blackout_dates.end_date IS 'Last date of unavailability (inclusive)';
COMMENT ON COLUMN person_blackout_dates.reason IS 'Optional reason for unavailability (e.g., "Vacation", "Out of town", "Personal commitment")';

-- Enable RLS
ALTER TABLE person_blackout_dates ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON person_blackout_dates TO anon;
GRANT ALL ON person_blackout_dates TO authenticated;
GRANT ALL ON person_blackout_dates TO service_role;

-- Add indexes for performance
CREATE INDEX idx_person_blackout_person ON person_blackout_dates(person_id);
CREATE INDEX idx_person_blackout_dates ON person_blackout_dates(start_date, end_date);
CREATE INDEX idx_person_blackout_start_date ON person_blackout_dates(start_date);
CREATE INDEX idx_person_blackout_end_date ON person_blackout_dates(end_date);

-- RLS Policies for person_blackout_dates

-- Parish members can read blackout dates for people in their parish
CREATE POLICY "Parish members can read blackout dates for their parish"
  ON person_blackout_dates
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
  ON person_blackout_dates
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
  ON person_blackout_dates
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
  ON person_blackout_dates
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
