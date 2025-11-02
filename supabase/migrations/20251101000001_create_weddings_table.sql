-- Create weddings table
CREATE TABLE weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  wedding_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  bride_id UUID REFERENCES people(id) ON DELETE SET NULL,
  groom_id UUID REFERENCES people(id) ON DELETE SET NULL,
  coordinator_id UUID REFERENCES people(id) ON DELETE SET NULL,
  presider_id UUID REFERENCES people(id) ON DELETE SET NULL,
  homilist_id UUID REFERENCES people(id) ON DELETE SET NULL,
  lead_musician_id UUID REFERENCES people(id) ON DELETE SET NULL,
  cantor_id UUID REFERENCES people(id) ON DELETE SET NULL,
  reception_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  rehearsal_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  rehearsal_dinner_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  witness_1_id UUID REFERENCES people(id) ON DELETE SET NULL,
  witness_2_id UUID REFERENCES people(id) ON DELETE SET NULL,
  status TEXT,
  output_version TEXT,
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
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users and anon role (used with JWT)
GRANT ALL ON weddings TO anon;
GRANT ALL ON weddings TO authenticated;
GRANT ALL ON weddings TO service_role;

-- Add indexes
CREATE INDEX idx_weddings_parish_id ON weddings(parish_id);
CREATE INDEX idx_weddings_wedding_event_id ON weddings(wedding_event_id);
CREATE INDEX idx_weddings_bride_id ON weddings(bride_id);
CREATE INDEX idx_weddings_groom_id ON weddings(groom_id);
CREATE INDEX idx_weddings_status ON weddings(status);

-- RLS Policies for weddings
-- Parish members can read weddings from their parish
CREATE POLICY "Parish members can read their parish weddings"
  ON weddings
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can insert weddings for their parish
CREATE POLICY "Parish members can create weddings for their parish"
  ON weddings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can update weddings from their parish
CREATE POLICY "Parish members can update their parish weddings"
  ON weddings
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can delete weddings from their parish
CREATE POLICY "Parish members can delete their parish weddings"
  ON weddings
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp on weddings
CREATE TRIGGER update_weddings_updated_at
  BEFORE UPDATE ON weddings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
