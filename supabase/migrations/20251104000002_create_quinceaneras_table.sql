-- Create quinceaneras table
CREATE TABLE quinceaneras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  quinceanera_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  quinceanera_reception_id UUID REFERENCES events(id) ON DELETE SET NULL,
  quinceanera_id UUID REFERENCES people(id) ON DELETE SET NULL,
  family_contact_id UUID REFERENCES people(id) ON DELETE SET NULL,
  coordinator_id UUID REFERENCES people(id) ON DELETE SET NULL,
  presider_id UUID REFERENCES people(id) ON DELETE SET NULL,
  homilist_id UUID REFERENCES people(id) ON DELETE SET NULL,
  lead_musician_id UUID REFERENCES people(id) ON DELETE SET NULL,
  cantor_id UUID REFERENCES people(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'PLANNING',
  quinceanera_template_id TEXT,
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE quinceaneras ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users and anon role (used with JWT)
GRANT ALL ON quinceaneras TO anon;
GRANT ALL ON quinceaneras TO authenticated;
GRANT ALL ON quinceaneras TO service_role;

-- Add indexes
CREATE INDEX idx_quinceaneras_parish_id ON quinceaneras(parish_id);
CREATE INDEX idx_quinceaneras_quinceanera_event_id ON quinceaneras(quinceanera_event_id);
CREATE INDEX idx_quinceaneras_quinceanera_reception_id ON quinceaneras(quinceanera_reception_id);
CREATE INDEX idx_quinceaneras_quinceanera_id ON quinceaneras(quinceanera_id);
CREATE INDEX idx_quinceaneras_status ON quinceaneras(status);

-- RLS Policies for quinceaneras
-- Parish members can read quinceaneras from their parish
CREATE POLICY "Parish members can read their parish quinceaneras"
  ON quinceaneras
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can insert quinceaneras for their parish
CREATE POLICY "Parish members can create quinceaneras for their parish"
  ON quinceaneras
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can update quinceaneras from their parish
CREATE POLICY "Parish members can update their parish quinceaneras"
  ON quinceaneras
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can delete quinceaneras from their parish
CREATE POLICY "Parish members can delete their parish quinceaneras"
  ON quinceaneras
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp on quinceaneras
CREATE TRIGGER update_quinceaneras_updated_at
  BEFORE UPDATE ON quinceaneras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
