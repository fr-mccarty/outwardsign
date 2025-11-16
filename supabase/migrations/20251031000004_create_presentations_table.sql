-- Create presentations table
CREATE TABLE presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  presentation_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  child_id UUID REFERENCES people(id) ON DELETE SET NULL,
  mother_id UUID REFERENCES people(id) ON DELETE SET NULL,
  father_id UUID REFERENCES people(id) ON DELETE SET NULL,
  coordinator_id UUID REFERENCES people(id) ON DELETE SET NULL,
  is_baptized BOOLEAN NOT NULL DEFAULT false,
  status TEXT DEFAULT 'PLANNING',
  note TEXT,
  presentation_template_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users and anon role (used with JWT)
GRANT ALL ON presentations TO anon;
GRANT ALL ON presentations TO authenticated;
GRANT ALL ON presentations TO service_role;

-- Add indexes
CREATE INDEX idx_presentations_parish_id ON presentations(parish_id);
CREATE INDEX idx_presentations_presentation_event_id ON presentations(presentation_event_id);
CREATE INDEX idx_presentations_child_id ON presentations(child_id);
CREATE INDEX idx_presentations_mother_id ON presentations(mother_id);
CREATE INDEX idx_presentations_father_id ON presentations(father_id);
CREATE INDEX idx_presentations_coordinator_id ON presentations(coordinator_id);
CREATE INDEX idx_presentations_status ON presentations(status);

-- RLS Policies for presentations
-- Parish members can read presentations from their parish
CREATE POLICY "Parish members can read their parish presentations"
  ON presentations
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can insert presentations for their parish
CREATE POLICY "Parish members can create presentations for their parish"
  ON presentations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can update presentations from their parish
CREATE POLICY "Parish members can update their parish presentations"
  ON presentations
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can delete presentations from their parish
CREATE POLICY "Parish members can delete their parish presentations"
  ON presentations
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp on presentations
CREATE TRIGGER update_presentations_updated_at
  BEFORE UPDATE ON presentations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
