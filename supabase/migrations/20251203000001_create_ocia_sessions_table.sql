-- Create ocia_sessions table
CREATE TABLE ocia_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ocia_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  coordinator_id UUID REFERENCES people(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'PLANNING',
  note TEXT,
  ocia_template_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE ocia_sessions ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users and anon role (used with JWT)
GRANT ALL ON ocia_sessions TO anon;
GRANT ALL ON ocia_sessions TO authenticated;
GRANT ALL ON ocia_sessions TO service_role;

-- Add indexes
CREATE INDEX idx_ocia_sessions_parish_id ON ocia_sessions(parish_id);
CREATE INDEX idx_ocia_sessions_event_id ON ocia_sessions(ocia_event_id);
CREATE INDEX idx_ocia_sessions_status ON ocia_sessions(status);

-- RLS Policies for ocia_sessions
-- Parish members can read ocia sessions from their parish
CREATE POLICY "Parish members can read their parish ocia sessions"
  ON ocia_sessions
  FOR SELECT
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can insert ocia sessions for their parish
CREATE POLICY "Parish members can create ocia sessions for their parish"
  ON ocia_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can update ocia sessions from their parish
CREATE POLICY "Parish members can update their parish ocia sessions"
  ON ocia_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Parish members can delete ocia sessions from their parish
CREATE POLICY "Parish members can delete their parish ocia sessions"
  ON ocia_sessions
  FOR DELETE
  TO anon, authenticated
  USING (
    auth.uid() IS NOT NULL AND
    parish_id IN (
      SELECT parish_id FROM parish_users WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp on ocia_sessions
CREATE TRIGGER update_ocia_sessions_updated_at
  BEFORE UPDATE ON ocia_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
