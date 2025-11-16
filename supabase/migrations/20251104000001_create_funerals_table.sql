-- Create funerals table
CREATE TABLE funerals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  funeral_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  funeral_meal_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  deceased_id UUID REFERENCES people(id) ON DELETE SET NULL,
  family_contact_id UUID REFERENCES people(id) ON DELETE SET NULL,
  coordinator_id UUID REFERENCES people(id) ON DELETE SET NULL,
  presider_id UUID REFERENCES people(id) ON DELETE SET NULL,
  homilist_id UUID REFERENCES people(id) ON DELETE SET NULL,
  lead_musician_id UUID REFERENCES people(id) ON DELETE SET NULL,
  cantor_id UUID REFERENCES people(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'PLANNING',
  first_reading_id UUID REFERENCES readings(id) ON DELETE SET NULL,
  psalm_id UUID REFERENCES readings(id) ON DELETE SET NULL,
  psalm_reader_id UUID REFERENCES people(id) ON DELETE SET NULL,
  psalm_is_sung BOOLEAN DEFAULT false,
  second_reading_id UUID REFERENCES readings(id) ON DELETE SET NULL,
  gospel_reading_id UUID REFERENCES readings(id) ON DELETE SET NULL,
  gospel_reader_id UUID REFERENCES people(id) ON DELETE SET NULL,
  first_reader_id UUID REFERENCES people(id) ON DELETE SET NULL,
  second_reader_id UUID REFERENCES people(id) ON DELETE SET NULL,
  petitions_read_by_second_reader BOOLEAN DEFAULT false,
  petition_reader_id UUID REFERENCES people(id) ON DELETE SET NULL,
  petitions TEXT,
  announcements TEXT,
  note TEXT,
  funeral_template_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE funerals ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users and anon role (used with JWT)
GRANT ALL ON funerals TO anon;
GRANT ALL ON funerals TO authenticated;
GRANT ALL ON funerals TO service_role;

-- Add indexes
CREATE INDEX idx_funerals_parish_id ON funerals(parish_id);
CREATE INDEX idx_funerals_funeral_event_id ON funerals(funeral_event_id);
CREATE INDEX idx_funerals_funeral_meal_event_id ON funerals(funeral_meal_event_id);
CREATE INDEX idx_funerals_deceased_id ON funerals(deceased_id);
CREATE INDEX idx_funerals_family_contact_id ON funerals(family_contact_id);
CREATE INDEX idx_funerals_status ON funerals(status);

-- RLS Policies for funerals
-- Parish members can read funerals from their parish
CREATE POLICY "Parish members can read their parish funerals"
  ON funerals
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can insert funerals for their parish
CREATE POLICY "Parish members can create funerals for their parish"
  ON funerals
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can update funerals from their parish
CREATE POLICY "Parish members can update their parish funerals"
  ON funerals
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can delete funerals from their parish
CREATE POLICY "Parish members can delete their parish funerals"
  ON funerals
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp on funerals
CREATE TRIGGER update_funerals_updated_at
  BEFORE UPDATE ON funerals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
