-- Create group_baptisms table
CREATE TABLE group_baptisms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  group_baptism_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  presider_id UUID REFERENCES people(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'PLANNING',
  note TEXT,
  group_baptism_template_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE group_baptisms ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users and anon role (used with JWT)
GRANT ALL ON group_baptisms TO anon;
GRANT ALL ON group_baptisms TO authenticated;
GRANT ALL ON group_baptisms TO service_role;

-- Add indexes
CREATE INDEX idx_group_baptisms_parish_id ON group_baptisms(parish_id);
CREATE INDEX idx_group_baptisms_event_id ON group_baptisms(group_baptism_event_id);
CREATE INDEX idx_group_baptisms_status ON group_baptisms(status);

-- RLS Policies for group_baptisms
-- Parish members can read group baptisms from their parish
CREATE POLICY "Parish members can read their parish group baptisms"
  ON group_baptisms
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can insert group baptisms for their parish
CREATE POLICY "Parish members can create group baptisms for their parish"
  ON group_baptisms
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can update group baptisms from their parish
CREATE POLICY "Parish members can update their parish group baptisms"
  ON group_baptisms
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can delete group baptisms from their parish
CREATE POLICY "Parish members can delete their parish group baptisms"
  ON group_baptisms
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp on group_baptisms
CREATE TRIGGER update_group_baptisms_updated_at
  BEFORE UPDATE ON group_baptisms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
