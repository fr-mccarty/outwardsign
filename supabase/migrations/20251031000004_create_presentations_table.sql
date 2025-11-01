-- Create presentations table
CREATE TABLE presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  child_sex TEXT NOT NULL CHECK (child_sex IN ('Male', 'Female')),
  mother_name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  godparents_names TEXT,
  is_baptized BOOLEAN NOT NULL DEFAULT false,
  language TEXT NOT NULL CHECK (language IN ('English', 'Spanish')),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  note TEXT,
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
CREATE INDEX idx_presentations_event_id ON presentations(event_id);
CREATE INDEX idx_presentations_language ON presentations(language);
CREATE INDEX idx_presentations_child_name ON presentations(child_name);

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
