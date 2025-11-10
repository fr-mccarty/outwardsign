-- Create baptisms table
CREATE TABLE baptisms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  baptism_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  child_id UUID REFERENCES people(id) ON DELETE SET NULL,
  mother_id UUID REFERENCES people(id) ON DELETE SET NULL,
  father_id UUID REFERENCES people(id) ON DELETE SET NULL,
  sponsor_1_id UUID REFERENCES people(id) ON DELETE SET NULL,
  sponsor_2_id UUID REFERENCES people(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  presider_id UUID REFERENCES people(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'ACTIVE',
  baptism_template_id TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE baptisms ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users and anon role (used with JWT)
GRANT ALL ON baptisms TO anon;
GRANT ALL ON baptisms TO authenticated;
GRANT ALL ON baptisms TO service_role;

-- Add indexes
CREATE INDEX idx_baptisms_parish_id ON baptisms(parish_id);
CREATE INDEX idx_baptisms_baptism_event_id ON baptisms(baptism_event_id);
CREATE INDEX idx_baptisms_child_id ON baptisms(child_id);
CREATE INDEX idx_baptisms_status ON baptisms(status);

-- RLS Policies for baptisms
-- Parish members can read baptisms from their parish
CREATE POLICY "Parish members can read their parish baptisms"
  ON baptisms
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can insert baptisms for their parish
CREATE POLICY "Parish members can create baptisms for their parish"
  ON baptisms
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can update baptisms from their parish
CREATE POLICY "Parish members can update their parish baptisms"
  ON baptisms
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can delete baptisms from their parish
CREATE POLICY "Parish members can delete their parish baptisms"
  ON baptisms
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp on baptisms
CREATE TRIGGER update_baptisms_updated_at
  BEFORE UPDATE ON baptisms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
